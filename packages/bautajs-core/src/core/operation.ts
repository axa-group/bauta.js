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
import { OpenAPI, OpenAPIV3 } from 'openapi-types';
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
import { getDefaultStatusCode } from '../open-api/validator-utils';
import { createContext } from '../utils/create-context';
import { isPromise } from '../utils/is-promise';

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

  public validateResponses(toggle: boolean): Operation {
    this.responseValidationEnabled = toggle;

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

  private isResponseJson(statusCode?: number): boolean {
    const responses = this.schema?.responses;

    if (responses) {
      // If default is not defined in the schema, we take as default response that for 200 response.
      const defaultStatus = getDefaultStatusCode(responses);
      const targetStatusCode = statusCode || defaultStatus;
      const contentSchema = (responses[targetStatusCode] as OpenAPIV3.ResponseObject)?.content;
      if (contentSchema) {
        const content = Object.keys(contentSchema)[0];

        if (content.startsWith('application/json')) {
          return true;
        }
      }
    }

    return false;
  }

  private shouldValidateResponse(
    ctx: Context,
    isResponseFinished: boolean,
    statusCode?: number
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

  public run<TRaw, TOut>(raw: RawData<TRaw>): PCancelable<TOut> | TOut {
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
      context.validateRequestSchema(this.getRequest(raw));
    }

    const result = this.handler(undefined, context, this.bautajs);
    // In case that is a promise convert it into a Cancelable promise
    if (isPromise(result)) {
      return PCancelable.fn<any, TOut>((_: any, onCancel: PCancelable.OnCancelFunction) => {
        onCancel(() => {
          context.token.isCanceled = true;
          context.token.cancel();
        });
        return result.then((finalResult: TOut) => {
          if (this.getResponse) {
            const responseStatus = this.getResponse(raw);

            if (
              this.shouldValidateResponse(
                context,
                responseStatus.isResponseFinished,
                responseStatus.statusCode
              )
            ) {
              context.validateResponseSchema(finalResult, responseStatus.statusCode);
            }
          }

          return finalResult;
        });
      })(null);
    }

    if (this.getResponse) {
      const responseStatus = this.getResponse(raw);
      if (
        this.shouldValidateResponse(
          context,
          responseStatus.isResponseFinished,
          responseStatus.statusCode
        )
      ) {
        context.validateResponseSchema(result, responseStatus.statusCode);
      }
    }

    return result;
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
