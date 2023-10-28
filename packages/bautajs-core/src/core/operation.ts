import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
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

  public deprecated = false;

  public requestValidationEnabled = true;

  public responseValidationEnabled = false;

  public handler: Pipeline.StepFunction<any, any>;

  private private?: boolean;

  private setupDone = false;

  private validator?: OperationValidators;

  constructor(public readonly id: string, private readonly bautajs: BautaJSInstance) {
    this.handler = buildDefaultStep();
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

  public validateRequest(toggle: boolean): Operation {
    this.requestValidationEnabled = toggle;

    return this;
  }

  public validateResponse(toggle: boolean): Operation {
    this.responseValidationEnabled = toggle;

    return this;
  }

  public validateRequestSchema(request: Request): void {
    this.validator?.validateRequest(request);
  }

  public validateResponseSchema(response: any, statusCode: number | string = 200): void {
    this.validator?.validateResponseSchema(response, statusCode);
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

  public shouldValidateRequest(): boolean {
    return this.requestValidationEnabled === true && !!this.validator?.validateRequest;
  }

  public shouldValidateResponse(statusCode: string | number = 200): boolean {
    // If we have a stream, the headers and finished flags are true as soon as the response
    // is piped and thus we cannot use those flags to determine if validation is required
    return (
      this.responseValidationEnabled === true &&
      !!this.validator?.validateResponseSchema &&
      this.isResponseJson(Number(statusCode))
    );
  }

  public run<TRaw, TOut>(raw: RawData<TRaw>): PCancelable<TOut> {
    const context: Context = createContext(
      {
        ...raw,
        log: raw.log
      },
      this.bautajs.logger
    );

    Object.assign(context, {
      validateResponseSchema: (response: any, statusCode?: string | number) =>
        this.shouldValidateResponse(statusCode) &&
        this.validateResponseSchema(response, statusCode),
      validateRequestSchema: (request: Request) =>
        this.shouldValidateRequest() && this.validateRequestSchema(request)
    });
    return PCancelable.fn<any, TOut>((_: any, onCancel: PCancelable.OnCancelFunction) => {
      onCancel(() => {
        context.token.isCanceled = true;
        context.token.cancel();
      });

      try {
        let result = this.handler(undefined, context, this.bautajs);

        if (!isPromise(result)) {
          result = Promise.resolve(result);
        }

        return result;
      } catch (e) {
        return Promise.reject(e);
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
