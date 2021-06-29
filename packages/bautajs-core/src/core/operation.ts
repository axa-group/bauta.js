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
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
// import Ajv from 'ajv';
import PCancelable from 'p-cancelable';
import {
  BautaJSInstance,
  Context,
  Operation,
  Route,
  OperationValidators,
  Pipeline,
  Request,
  RawData
} from '../types';
import { buildDefaultStep } from '../utils/default-step';
import { createContext } from '../utils/create-context';
import { isPromise } from '../utils/is-promise';
import { ValidationError } from './validation-error';

export class OperationBuilder implements Operation {
  public static create(id: string, bautajs: BautaJSInstance): Operation {
    return new OperationBuilder(id, bautajs);
  }

  public route?: Route;

  public schema?: OpenAPI.Operation;

  public deprecated: boolean = false;

  public requestValidationEnabled: Boolean = true;

  public responseValidationEnabled: Boolean = false;

  public handler: Pipeline.StepFunction<any, any>;

  private private?: boolean;

  private setupDone: boolean = false;

  private validator?: OperationValidators;

  private getRequest?: Function;

  private getResponse?: Function;

  constructor(public readonly id: string, private readonly bautajs: BautaJSInstance) {
    this.handler = buildDefaultStep();
    this.getRequest =
      typeof this.bautajs.options.getRequest === 'function'
        ? this.bautajs.options.getRequest.bind(this)
        : undefined;
    this.getResponse =
      typeof this.bautajs.options.getResponse === 'function'
        ? this.bautajs.options.getResponse.bind(this)
        : undefined;
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
    this.requestValidationEnabled = toggle;

    return this;
  }

  public validateRequest(toggle: boolean): Operation {
    this.requestValidationEnabled = toggle;

    return this;
  }

  public validateResponse(toggle: boolean): Operation {
    this.responseValidationEnabled = toggle;

    return this;
  }

  public addRoute(route: Route) {
    this.schema = route.openapiSource;
    this.route = route;
    // Generate validators on setup operations only
    if (this.setupDone === true) {
      this.validator = this.bautajs.validator.generate(route.schema);
    }
  }

  private isResponseJson(statusCode: number): boolean {
    const responses = this.schema?.responses;
    const hasJSONContent = (response: any) =>
      Object.keys(response.content).some(c => c.includes('application/json'));
    if (responses) {
      if (this.route?.isV2) {
        return !!(
          (this.schema as OpenAPIV2.OperationObject).produces?.includes('application/json') &&
          (responses[statusCode] || responses.default)
        );
      }

      if (responses[statusCode]) {
        if ((responses[statusCode] as OpenAPIV3.ResponseObject).content) {
          return hasJSONContent(responses[statusCode]);
        }
      }

      if (responses.default && (responses.default as OpenAPIV3.ResponseObject).content) {
        return hasJSONContent(responses.default);
      }

      throw new ValidationError(
        `Status code ${statusCode || 'default'} not defined on schema`,
        [],
        500
      );
    }

    return false;
  }

  private static getStatusCode(res: any): number | undefined {
    return res.statusCode !== null &&
      res.statusCode !== undefined &&
      Number.isInteger(res.statusCode)
      ? res.statusCode
      : undefined;
  }

  private shouldValidateResponse(
    ctx: Context,
    isResponseFinished: boolean,
    statusCode: number
  ): boolean {
    // If we have a stream, the headers and finished flags are true as soon as the response
    // is piped and thus we cannot use those flags to determine if validation is required
    if (!this.isResponseJson(statusCode)) {
      return false; // No validation for streams
    }
    const isValidationFunctionSet =
      this.responseValidationEnabled === true && !!ctx.validateResponseSchema;
    return isValidationFunctionSet && !isResponseFinished;
  }

  public run<TRaw, TOut>(raw: RawData<TRaw>): PCancelable<TOut> {
    const context: Context = createContext({
      ...raw,
      log: raw.log || this.bautajs.logger
    });

    if (this.requestValidationEnabled) {
      Object.assign(context, {
        validateRequestSchema: (request: Request) =>
          this.validator && this.validator.validateRequest(request)
      });
    }

    if (this.responseValidationEnabled) {
      Object.assign(context, {
        validateResponseSchema: (response: any, statusCode?: number | string) =>
          this.validator && this.validator.validateResponseSchema(response, statusCode)
      });
    }
    if (
      this.getRequest &&
      context.validateRequestSchema &&
      this.requestValidationEnabled === true
    ) {
      try {
        context.validateRequestSchema(this.getRequest(raw));
      } catch (e) {
        return new PCancelable((_, reject) => {
          reject(e);
        });
      }
    }

    return PCancelable.fn<any, TOut>((_: any, onCancel: PCancelable.OnCancelFunction) => {
      onCancel(() => {
        context.token.isCanceled = true;
        context.token.cancel();
      });
      const onError = (e: Error & { toJSON: () => any; statusCode: number }) => {
        // Only validate errors against the swagger if has toJSON function
        if (!(e instanceof ValidationError) && this.getResponse && typeof e.toJSON === 'function') {
          const responseStatus = this.getResponse(raw);
          const statusCode = OperationBuilder.getStatusCode(responseStatus) || e.statusCode;
          if (
            statusCode &&
            this.shouldValidateResponse(context, responseStatus.isResponseFinished, statusCode)
          ) {
            context.validateResponseSchema(e.toJSON(), statusCode);
          }
        }
        throw e;
      };

      try {
        let result = this.handler(undefined, context, this.bautajs);

        if (!isPromise(result)) {
          result = Promise.resolve(result);
        }

        return result
          .then((finalResult: TOut) => {
            if (this.getResponse) {
              const responseStatus = this.getResponse(raw);
              const statusCode = OperationBuilder.getStatusCode(responseStatus) || 200;
              if (
                this.shouldValidateResponse(context, responseStatus.isResponseFinished, statusCode)
              ) {
                context.validateResponseSchema(finalResult, statusCode);
              }
            }

            return finalResult;
          })
          .catch(onError);
      } catch (e) {
        return Promise.reject(onError(e));
      }
    })(null);
  }

  public setup(step: Pipeline.StepFunction<undefined, any>): void {
    if (typeof step !== 'function') {
      throw new Error('"step" must be a Pipeline.StepFunction.');
    }

    this.handler = step;

    this.setupDone = true;
    if (this.private === undefined) {
      this.private = false;
    }
  }
}

export default OperationBuilder;
