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
import { OpenAPI } from 'openapi-types';
import PCancelable from 'p-cancelable';
import {
  BautaJSInstance,
  Context,
  ContextData,
  OpenAPIComponents,
  Operation,
  SwaggerComponents,
  EventTypes,
  OperatorFunction,
  PipelineSetup
} from '../utils/types';
import { buildDefaultPipeline } from '../utils/default-pipeline';
import { ValidationError } from './validation-error';
import { logger } from '../logger';
import { createContext } from '../utils/create-context';
import { pipelineBuilder } from '../decorators/pipeline';

export class OperationBuilder implements Operation {
  public static create(
    id: string,
    operationSchema: OpenAPI.Operation,
    components: SwaggerComponents | OpenAPIComponents,
    bautajs: BautaJSInstance
  ): Operation {
    return new OperationBuilder(id, operationSchema, components, bautajs);
  }

  public version: string;

  public nextVersionOperation?: Operation;

  public deprecated: boolean = false;

  private private?: boolean;

  private operatorFunction: OperatorFunction<undefined, any>;

  private setupDone: boolean = false;

  private readonly validation: any = {
    validateReqBuilder: null,
    validateResBuilder: null,
    validateReqEnabled: false,
    validateResEnabled: false
  };

  constructor(
    public readonly id: string,
    public readonly schema: OpenAPI.Operation,
    components: SwaggerComponents | OpenAPIComponents,
    private readonly bautajs: BautaJSInstance
  ) {
    this.operatorFunction = buildDefaultPipeline();
    this.deprecated = schema.deprecated === undefined ? false : schema.deprecated;
    this.version = components.apiVersion;
    this.generateValidators(schema, components);
  }

  public isSetup() {
    return this.setupDone;
  }

  public isPrivate() {
    return this.private === true || this.private === undefined;
  }

  public setAsPrivate(): Operation {
    this.private = true;

    return this;
  }

  public setAsDeprecated(): Operation {
    this.deprecated = true;

    return this;
  }

  public validateRequests(toggle: boolean): Operation {
    if (this.validation) {
      this.validation.validateReqEnabled = toggle;
    }
    return this;
  }

  public validateResponses(toggle: boolean): Operation {
    if (this.validation) {
      this.validation.validateResEnabled = toggle;
    }
    return this;
  }

  private generateValidators(
    operationSchema: any,
    components: SwaggerComponents | OpenAPIComponents
  ): void {
    let schemas: any;
    if (components.swaggerVersion === '2') {
      schemas = (components as SwaggerComponents).definitions;
    } else {
      // eslint-disable-next-line prefer-destructuring
      schemas = (components as OpenAPIComponents).schemas;
    }
    const validateRequest = new OpenapiRequestValidator({
      ...operationSchema,
      schemas
    });
    const validateResponse = new OpenapiResponseValidator({
      ...operationSchema,
      components: { schemas },
      definitions: schemas
    });

    // BUG related to: https://github.com/kogosoftwarellc/open-api/issues/381
    const defaultSetter = new OpenapiDefaultSetter({ parameters: [], ...operationSchema });
    this.validation.validateReqBuilder = (req: any) => {
      defaultSetter.handle(req);
      if (!req.headers) {
        // if is not a Nodejs request set the content-type to force validation
        req.headers = { 'content-type': 'application/json' };
      }

      const verror = validateRequest.validateRequest(req);
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
    if (components.validateRequest === undefined || components.validateRequest === true) {
      this.validateRequests(true);
    }

    if (components.validateResponse === undefined || components.validateResponse === true) {
      this.validateResponses(true);
    }
  }

  public run(ctx: ContextData = {}): PCancelable<any> {
    const context: Context = createContext(ctx);

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
      try {
        context.validateRequest(ctx.req);
      } catch (e) {
        return new PCancelable((_, reject) => {
          reject(e);
        });
      }
    }

    return PCancelable.fn((_: any, onCancel: PCancelable.OnCancelFunction) => {
      onCancel(() => {
        context.token.isCanceled = true;
        context.token.cancel();
      });
      try {
        let result = this.operatorFunction(undefined, context, this.bautajs);
        if (!(result instanceof Promise)) {
          result = Promise.resolve(result);
        }

        return result.then((finalResult: any) => {
          if (
            this.validation.validateResEnabled === true &&
            context.validateResponse &&
            !context.res.headersSent &&
            !context.res.finished
          ) {
            context.validateResponse(
              finalResult,
              context.res.statusCode !== null &&
                context.res.statusCode !== undefined &&
                Number.isInteger(context.res.statusCode)
                ? context.res.statusCode
                : undefined
            );
          }

          return finalResult;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    })(null);
  }

  public setup(pipelineSetup: PipelineSetup<undefined>): void {
    this.operatorFunction = pipelineBuilder<undefined, any>(pipelineSetup, param => {
      logger.debug(
        `[OK] ${param.name || 'anonymous function or pipeline'} pushed to .${this.version}.${
          this.id
        }`
      );
      logger.events.emit(EventTypes.PUSH_OPERATOR, {
        operator: param,
        version: this.version,
        operationId: this.id
      });
    });

    if (!this.deprecated && this.nextVersionOperation && !this.nextVersionOperation.isSetup()) {
      this.nextVersionOperation.setup(pipelineSetup);
    }

    this.setupDone = true;
    if (this.private === undefined) {
      this.private = false;
    }
  }
}

export default OperationBuilder;
