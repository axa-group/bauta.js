/*
 * Copyright (c) AXA Shared Services Spain S.A.
 *
 * Licensed under the AXA Shared Services Spain S.A. License (the "License"); you
 * may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import OpenapiDefaultSetter from 'openapi-default-setter';
import OpenapiRequestValidator from 'openapi-request-validator';
import OpenapiResponseValidator from 'openapi-response-validator';
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import { buildDataSource } from '../request/datasource';
import { sessionFactory } from '../session-factory';
import { defaultResolver } from '../utils/default-resolver';
import {
  Context,
  ContextData,
  Document,
  ErrorHandler,
  Operation,
  OperationDataSourceBuilder,
  OperationTemplate,
  PathItemObject,
  PathsObject,
  Pipeline
} from '../utils/types';
import apiPathSchemaJson from '../validators/api-path-schema.json';
import { validate } from '../validators/validate';
import { Accesor, PipelineBuilder } from './pipeline';
import { ValidationError } from './validation-error';

function findOperation(id: string, paths: PathsObject): PathsObject | null {
  let schema: PathsObject | null = null;

  Object.keys(paths).some((pathKey: string) =>
    Object.keys(paths[pathKey]).some((methodKey: string) => {
      const pathItem: PathItemObject = paths[pathKey] as PathItemObject;
      const operationObject: OpenAPI.Operation = pathItem[
        methodKey as keyof PathItemObject
      ] as OpenAPI.Operation;

      if (operationObject.operationId === id) {
        schema = { [pathKey]: { [methodKey]: operationObject } };
        return true;
      }

      return false;
    })
  );

  return schema;
}

export class OperationBuilder<TReq, TRes> implements Operation<TReq, TRes> {
  public static create<TReq, TRes>(
    operationId: string,
    operationTemplate: OperationTemplate,
    apiDefinition: Document,
    serviceId: string
  ): Operation<TReq, TRes> {
    return new OperationBuilder<TReq, TRes>(
      operationId,
      operationTemplate,
      apiDefinition,
      serviceId
    );
  }

  public private: boolean = false;

  public schema: PathsObject | null = null;

  public dataSource: OperationDataSourceBuilder;

  public nextVersionOperation: null | Operation<TReq, TRes> = null;

  private errorHandler: ErrorHandler<TReq, TRes>;

  private readonly validation: any = {
    validateReqBuilder: null,
    validateResBuilder: null,
    validateReqEnabled: false,
    validateResEnabled: false
  };

  private accesor = new Accesor<TReq, TRes>();

  private pipelineSetUp: boolean = false;

  constructor(
    public readonly operationId: string,
    operationTemplate: OperationTemplate,
    public readonly apiDefinition: Document,
    public readonly serviceId: string
  ) {
    this.dataSource = buildDataSource<TReq, TRes>(operationTemplate);
    this.private = operationTemplate.private as boolean;
    this.errorHandler = (err: Error) => Promise.reject(err);

    if (apiDefinition) {
      const schema: PathsObject | null = findOperation(this.operationId, apiDefinition.paths);
      if (schema) {
        this.setSchema(schema);
      }
    }
  }

  public setErrorHandler(errorHandler: ErrorHandler<TReq, TRes>): Operation<TReq, TRes> {
    if (typeof errorHandler !== 'function') {
      throw new Error(
        `The errorHandler must be a function, instead an ${typeof errorHandler} was found`
      );
    }

    this.errorHandler = errorHandler;
    // Propagate the error handler to the next versions
    if (this.nextVersionOperation) {
      this.nextVersionOperation.setErrorHandler(errorHandler);
    }

    return this;
  }

  public validateRequest(toggle: boolean): Operation<TReq, TRes> {
    if (this.validation) {
      this.validation.validateReqEnabled = toggle;
    }
    return this;
  }

  public validateResponse(toggle: boolean): Operation<TReq, TRes> {
    if (this.validation) {
      this.validation.validateResEnabled = toggle;
    }
    return this;
  }

  public setSchema(schema: PathsObject): Operation<TReq, TRes> {
    const error = validate(schema, apiPathSchemaJson);
    if (error) {
      throw new Error(`Invalid schema, "${error[0].dataPath}" ${error[0].message}`);
    }
    const [endpointDefinition] = Object.values(Object.values(schema)[0]);
    // Determine OpenAPI version
    const openApiV3ApiDefinition = this.apiDefinition as OpenAPIV3.Document;
    const opernApiV2ApiDefinition = this.apiDefinition as OpenAPIV2.Document;

    const schemas =
      !!openApiV3ApiDefinition.openapi && !!openApiV3ApiDefinition.components
        ? openApiV3ApiDefinition.components.schemas
        : opernApiV2ApiDefinition.definitions;

    const validateRequest = new OpenapiRequestValidator({
      ...endpointDefinition,
      schemas
    });
    const validateResponse = new OpenapiResponseValidator({
      ...endpointDefinition,
      components: { schemas },
      definitions: schemas
    });

    this.schema = schema;
    // BUG: https://github.com/kogosoftwarellc/open-api/issues/381
    const defaultSetter = new OpenapiDefaultSetter({
      parameters: [],
      ...endpointDefinition
    });
    this.validation.validateReqBuilder = (req: any) => {
      defaultSetter.handle(req);
      if (!req.headers) {
        // if is not a Nodejs request set the content-type to force validation
        req.headers = { 'content-type': 'application/json' };
      }

      const verror = validateRequest.validate(req);
      if (verror && verror.errors && verror.errors.length > 0) {
        throw new ValidationError(
          verror.message,
          verror.errors,
          verror.status === 400 ? 422 : verror.status
        );
      }

      return null;
    };
    this.validation.validateResBuilder = (res: TRes, statusCode: number = 200) => {
      const verror = validateResponse.validateResponse(statusCode, res);

      if (verror && verror.errors && verror.errors.length > 0) {
        throw new ValidationError(verror.message, verror.errors, 500, res);
      }

      return null;
    };
    if (
      this.apiDefinition.validateRequest === undefined ||
      this.apiDefinition.validateRequest === true
    ) {
      this.validateRequest(true);
    }

    if (
      this.apiDefinition.validateResponse === undefined ||
      this.apiDefinition.validateResponse === true
    ) {
      this.validateResponse(true);
    }

    // Propagate the definitions to the next versions
    if (this.nextVersionOperation) {
      this.nextVersionOperation.setSchema(schema);
    }

    return this;
  }

  public run(ctx: ContextData<TReq, TRes>): Promise<any> {
    if (!ctx.req) {
      throw new Error('The context(req) parameter is mandatory');
    }

    if (!ctx.res) {
      throw new Error('The context(res) parameter is mandatory');
    }

    const context: Context<TReq, TRes> = {
      data: {},
      ...ctx,
      dataSource: this.dataSource,
      metadata: {
        operationId: this.operationId,
        serviceId: this.serviceId,
        version: this.apiDefinition.info.version
      },
      ...sessionFactory(ctx.req),
      validateRequest: (request: any = ctx.req) => request,
      validateResponse: (response: any) => response
    };

    if (this.schema) {
      Object.assign(context, {
        validateRequest: (request: any = ctx.req) =>
          this.validation.validateReqBuilder && this.validation.validateReqBuilder(request),
        validateResponse: this.validation.validateResBuilder
      });
    }

    // Validate the request
    if (context.validateRequest && this.validation.validateReqEnabled === true) {
      context.validateRequest(ctx.req);
    }
    let result = this.pipelineSetUp
      ? this.accesor.handler(undefined, context)
      : defaultResolver(undefined, context);

    if (!(result instanceof Promise)) {
      result = Promise.resolve(result);
    }

    return result
      .then((finalResult: any) => {
        if (this.validation.validateResEnabled === true && context.validateResponse) {
          const { statusCode } = context.res as any;
          context.validateResponse(
            finalResult,
            statusCode !== null && statusCode !== undefined && Number.isInteger(statusCode)
              ? statusCode
              : undefined
          );
        }

        return finalResult;
      })
      .catch((e: Error) => this.errorHandler(e, context));
  }

  public setup(fn: (pipeline: Pipeline<TReq, TRes, undefined>) => void): Operation<TReq, TRes> {
    fn(
      new PipelineBuilder<TReq, TRes, undefined>(
        this.accesor,
        this.serviceId,
        this.apiDefinition.info.version,
        this.operationId
      )
    );

    if (this.nextVersionOperation) {
      this.nextVersionOperation.setup(fn);
    }

    this.pipelineSetUp = true;

    return this;
  }
}

export default OperationBuilder;
