/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Licensed under the AXA Group Operations Spain S.A. License (the "License");
 * you may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { OpenAPI } from 'openapi-types';
import Ajv from 'ajv';
import PCancelable from 'p-cancelable';
import {
  BautaJSInstance,
  Context,
  ContextData,
  Operation,
  OperatorFunction,
  PipelineSetup,
  Route,
  RouteSchema,
  Dictionary,
  TResponse
} from '../types';
import { buildDefaultPipeline } from '../utils/default-pipeline';

import { createContext } from '../utils/create-context';
import { pipelineBuilder } from '../decorators/pipeline';
import {
  bodySchema,
  buildSchemaCompiler,
  querystringSchema,
  paramsSchema,
  headersSchema,
  responseSchema,
  validateRequest,
  validateResponse,
  getDefaultStatusCode
} from '../open-api/build-validators';

export class OperationBuilder implements Operation {
  public static create(id: string, version: string, bautajs: BautaJSInstance): Operation {
    return new OperationBuilder(id, version, bautajs);
  }

  public route?: Route;

  public schema?: OpenAPI.Operation;

  public nextVersionOperation?: Operation;

  public deprecated: boolean = false;

  public requestValidationEnabled: Boolean = true;

  public responseValidationEnabled: Boolean = false;

  private private?: boolean;

  private operatorFunction: OperatorFunction<undefined, any>;

  private setupDone: boolean = false;

  private validators: Dictionary<Dictionary<Ajv.ValidateFunction> | Ajv.ValidateFunction> = {};

  constructor(
    public readonly id: string,
    public version: string,
    private readonly bautajs: BautaJSInstance
  ) {
    this.operatorFunction = buildDefaultPipeline();
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
    if (this.validators) {
      this.requestValidationEnabled = toggle;
    }
    return this;
  }

  public validateResponses(toggle: boolean): Operation {
    if (this.validators) {
      this.responseValidationEnabled = toggle;
    }
    return this;
  }

  public validateRequest(toggle: boolean): Operation {
    if (this.validators) {
      this.requestValidationEnabled = toggle;
    }
    return this;
  }

  public validateResponse(toggle: boolean): Operation {
    if (this.validators) {
      this.responseValidationEnabled = toggle;
    }
    return this;
  }

  public addRoute(route: Route) {
    this.schema = route.openapiSource;
    this.route = route;
    // Generate validators on setup operations only
    if (this.setupDone === true) {
      this.generateValidators(route.schema);
    }
  }

  private generateValidators(operationSchema: RouteSchema): void {
    if (operationSchema.body) {
      this.validators[bodySchema.toString()] = buildSchemaCompiler(operationSchema.body);
    }
    if (operationSchema.querystring) {
      this.validators[querystringSchema.toString()] = buildSchemaCompiler(
        operationSchema.querystring
      );
    }
    if (operationSchema.params) {
      this.validators[paramsSchema.toString()] = buildSchemaCompiler(operationSchema.params);
    }
    if (operationSchema.headers) {
      this.validators[headersSchema.toString()] = buildSchemaCompiler(operationSchema.headers);
    }
    if (operationSchema.response) {
      this.validators[responseSchema.toString()] = Object.keys(operationSchema.response).reduce(
        (acc: Dictionary<Ajv.ValidateFunction>, statusCode: string) => {
          if (operationSchema.response && operationSchema.response[statusCode]) {
            acc[statusCode] = buildSchemaCompiler(operationSchema.response[statusCode]);
          }
          return acc;
        },
        {}
      );
    }
  }

  private isResponseJson(statusCode?: number): boolean {
    const responses = this.schema?.responses;

    if (responses) {
      // If default is not defined in the schema, we take as default response that for 200 response.
      const defaultStatus = getDefaultStatusCode(responses);
      const targetStatusCode = statusCode || defaultStatus;

      if (responses[targetStatusCode] && responses[targetStatusCode].content) {
        const content = Object.keys(responses[targetStatusCode].content)[0];

        if (content.startsWith('application/json')) {
          return true;
        }
      }
    }

    return false;
  }

  private static getStatusCode(res: TResponse): number | undefined {
    return res.statusCode !== null &&
      res.statusCode !== undefined &&
      Number.isInteger(res.statusCode)
      ? res.statusCode
      : undefined;
  }

  private mustValidate(context: Context, statusCode?: number): boolean {
    // If we have a stream, the headers and finished flags are true as soon as the response
    // is piped and thus we cannot use those flags to determine if validation is required
    if (!this.isResponseJson(statusCode)) {
      return false; // No validation for streams
    }

    const isValidationFunctionSet =
      this.responseValidationEnabled === true && !!context.validateResponse;

    const isResponseFinished = context.res.headersSent || context.res.finished;

    return isValidationFunctionSet && !isResponseFinished;
  }

  public run(ctx: ContextData = {}): PCancelable<any> {
    const context: Context = createContext(ctx, this.bautajs.logger);

    if (this.requestValidationEnabled) {
      Object.assign(context, {
        validateRequest: (request: any = ctx.req) =>
          validateRequest(this.validators as Dictionary<Ajv.ValidateFunction>, request)
      });
    }

    if (this.responseValidationEnabled) {
      Object.assign(context, {
        validateResponse: (response: any, statusCode?: number | string) =>
          validateResponse(
            this.validators as Dictionary<Dictionary<Ajv.ValidateFunction>>,
            response,
            statusCode
          )
      });
    }

    // Validate the request
    if (context.validateRequest && this.requestValidationEnabled === true) {
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
          const statusCode = OperationBuilder.getStatusCode(context.res);

          if (this.mustValidate(context, statusCode)) {
            context.validateResponse(finalResult, statusCode);
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
      this.bautajs.logger.debug(
        `[OK] ${param.name || 'anonymous function or pipeline'} pushed to .${this.version}.${
          this.id
        }`
      );
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
