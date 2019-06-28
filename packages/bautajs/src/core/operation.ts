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
import { logger } from '../logger';
import { buildDataSource } from '../request/datasource';
import { sessionFactory } from '../session-factory';
import { defaultResolver } from '../utils/default-resolver';
import { getStrictDefinition } from '../utils/strict-definitions';
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
import { Accesor, PipelineBuilder } from './pipeline';
import { ValidationError } from './validation-error';

function filterPaths(id: string, apiDefinition: Document): Document {
  const paths: PathsObject = {};

  Object.keys(apiDefinition.paths).some((pathKey: string) =>
    Object.keys(apiDefinition.paths[pathKey]).some((methodKey: string) => {
      const pathItem: PathItemObject = apiDefinition.paths[pathKey] as PathItemObject;
      const operationObject: OpenAPI.Operation = pathItem[
        methodKey as keyof PathItemObject
      ] as OpenAPI.Operation;

      if (operationObject.operationId === id) {
        paths[pathKey] = { [methodKey]: operationObject };
        return true;
      }

      return false;
    })
  );

  return { ...apiDefinition, paths };
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

  public schema: Document;

  private dataSource: OperationDataSourceBuilder;

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
    apiDefinition: Document,
    public readonly serviceId: string
  ) {
    this.dataSource = buildDataSource<TReq, TRes>(operationTemplate);
    this.private = operationTemplate.private as boolean;
    this.errorHandler = (err: Error) => Promise.reject(err);
    this.schema = this.getSchema(apiDefinition);
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

  private getSchema(apiDefinition: Document): Document {
    const strictSchema = getStrictDefinition(filterPaths(this.operationId, apiDefinition));

    if (Object.keys(strictSchema.paths).length === 0) {
      logger.warn(`[Not] Path not found for operation "${this.operationId}"`);
    } else {
      const [endpointDefinition] = Object.values(Object.values(strictSchema.paths)[0]);
      // Determine OpenAPI version
      const openApiV3ApiDefinition = apiDefinition as OpenAPIV3.Document;
      const opernApiV2ApiDefinition = apiDefinition as OpenAPIV2.Document;

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

      // BUG related to: https://github.com/kogosoftwarellc/open-api/issues/381
      const defaultSetter = new OpenapiDefaultSetter({ parameters: [], ...endpointDefinition });
      this.validation.validateReqBuilder = (req: any) => {
        defaultSetter.handle(req);
        if (!req.headers) {
          // if is not a Nodejs request set the content-type to force validation
          req.headers = { 'content-type': 'application/json' };
        }

        const verror = validateRequest.validate(req);
        if (verror && verror.errors && verror.errors.length > 0) {
          throw new ValidationError(
            'The request was not valid',
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
      if (apiDefinition.validateRequest === undefined || apiDefinition.validateRequest === true) {
        this.validateRequest(true);
      }

      if (apiDefinition.validateResponse === undefined || apiDefinition.validateResponse === true) {
        this.validateResponse(true);
      }
    }

    return strictSchema;
  }

  public run(ctx: ContextData<TReq, TRes> = {}): Promise<any> {
    if (!ctx.req) {
      ctx.req = {} as TReq;
    }

    if (!ctx.res) {
      ctx.res = {} as TRes;
    }

    const context: Context<TReq, TRes> = {
      data: ctx.data || {},
      req: ctx.req,
      res: ctx.res,
      dataSource: this.dataSource,
      metadata: {
        operationId: this.operationId,
        serviceId: this.serviceId,
        version: this.schema.info.version
      },
      ...sessionFactory(ctx.req),
      validateRequest: (request: any = ctx.req) => request,
      validateResponse: (response: any) => response
    };

    if (this.validation.validateReqBuilder) {
      Object.assign(context, {
        validateRequest: (request: any = ctx.req) =>
          this.validation.validateReqBuilder && this.validation.validateReqBuilder(request)
      });
    }

    if (this.validation.validateResBuilder) {
      Object.assign(context, {
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
        this.schema.info.version,
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
