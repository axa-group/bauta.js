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
import { sessionFactory } from '../session-factory';
import { defaultResolver } from '../utils/default-resolver';
import { getStrictDefinition } from '../utils/strict-definitions';
import {
  BautaJSInstance,
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
import { buildDataSource } from './datasource';
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

export class OperationBuilder implements Operation {
  public static create(
    operationId: string,
    dataSourceBuilder: OperationTemplate<any, any>,
    apiDefinition: Document,
    serviceId: string,
    bautajs: BautaJSInstance
  ): Operation {
    return new OperationBuilder(operationId, dataSourceBuilder, apiDefinition, serviceId, bautajs);
  }

  public private: boolean = false;

  public schema: Document;

  public dataSourceBuilder: OperationDataSourceBuilder<any>;

  public nextVersionOperation: null | Operation = null;

  private errorHandler: ErrorHandler;

  private readonly validation: any = {
    validateReqBuilder: null,
    validateResBuilder: null,
    validateReqEnabled: false,
    validateResEnabled: false
  };

  private accesor = new Accesor();

  private pipelineSetUp: boolean = false;

  constructor(
    public readonly operationId: string,
    operationDataSource: OperationTemplate<any, any>,
    apiDefinition: Document,
    public readonly serviceId: string,
    private readonly bautjas: BautaJSInstance
  ) {
    this.dataSourceBuilder = buildDataSource(operationDataSource, bautjas);
    this.private = operationDataSource.private as boolean;
    this.errorHandler = (err: Error) => Promise.reject(err);
    this.schema = this.getSchema(apiDefinition);
  }

  public setErrorHandler(errorHandler: ErrorHandler): Operation {
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

  public validateRequest(toggle: boolean): Operation {
    if (this.validation) {
      this.validation.validateReqEnabled = toggle;
    }
    return this;
  }

  public validateResponse(toggle: boolean): Operation {
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
      this.validation.validateResBuilder = (res: any, statusCode: number = 200) => {
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

  public run(ctx: ContextData = {}): Promise<any> {
    if (!ctx.req) {
      ctx.req = {};
    }

    if (!ctx.res) {
      ctx.res = {};
    }

    const context: Context = {
      data: ctx.data || {},
      // @ts-ignore
      req: ctx.req,
      res: ctx.res,
      dataSourceBuilder: this.dataSourceBuilder,
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
      ? this.accesor.handler(undefined, context, this.bautjas)
      : defaultResolver(undefined, context);

    if (!(result instanceof Promise)) {
      result = Promise.resolve(result);
    }

    return result
      .then((finalResult: any) => {
        if (this.validation.validateResEnabled === true && context.validateResponse) {
          // @ts-ignore
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

  public setup(fn: (pipeline: Pipeline<undefined>) => void): Operation {
    fn(
      new PipelineBuilder<undefined>(
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
