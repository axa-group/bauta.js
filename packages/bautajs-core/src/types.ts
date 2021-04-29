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
import PCancelable from 'p-cancelable';
import { Bindings } from 'pino';
import Ajv from 'ajv';

export type JSONSchema = any;

export interface GenericError extends Error {
  [key: string]: any;
}

export interface RouteResponse {
  [code: number]: JSONSchema;
  [code: string]: JSONSchema;
}

export interface BasicOperation {
  readonly id: string;
  readonly deprecated: boolean;
  readonly version: string;
}

export interface RouteSchema {
  body?: JSONSchema;
  querystring?: JSONSchema;
  params?: JSONSchema;
  headers?: JSONSchema;
  response?: RouteResponse;
}

export interface Route {
  method: string;
  url: string;
  schema: RouteSchema;
  operationId: string;
  openapiSource: OpenAPI.Operation;
  operation?: Operation;
  isV2: boolean;
  basePath?: string;
  path: string;
}
export interface Request {
  params?: any;
  body?: any;
  query?: any;
  headers?: any;
}
export interface Response {
  [key: string]: any;
  statusCode?: any;
  headersSent?: boolean;
  finished?: boolean;
}
export interface Validator<TypeValidateFunction> {
  /**
   * Validates a single schema. Note: mainly exposed as public for fastify.
   *
   * @memberof Validator
   */
  buildSchemaCompiler: (schema: JSONSchema) => TypeValidateFunction;

  /**
   * Generates the validators. Needed because you may not be able to generate them when creating the instance of Validator
   *
   * @memberof Validator
   */
  generate: (operationSchema: RouteSchema) => OperationValidators;
}

export interface OperationValidators {
  validateRequest(request: Request): void;
  validateResponseSchema(response: any, statusCode?: number | string): void;
}

export type Generic = Omit<OpenAPI.Document, 'paths'> & { basePath?: string };

export interface DocumentParsed {
  generic: Generic;
  routes: Route[];
}

export interface Dictionary<T> {
  [key: string]: T;
}

// OpenAPI document
export interface OpenAPIV2Document extends OpenAPIV2.Document {}
export interface OpenAPIV3Document extends OpenAPIV3.Document {
  basePath?: string;
}
export interface SwaggerComponents {
  validateRequest?: boolean;
  validateResponse?: boolean;
  swaggerVersion: string;
  apiVersion: string;
  schemes?: string[];
  consumes?: string[];
  produces?: string[];
  definitions?: OpenAPIV2.DefinitionsObject;
  parameters?: OpenAPIV2.ParametersDefinitionsObject;
  responses?: OpenAPIV2.ResponsesDefinitionsObject;
  securityDefinitions?: OpenAPIV2.SecurityDefinitionsObject;
  security?: OpenAPIV2.SecurityRequirementObject[];
  externalDocs?: OpenAPIV2.ExternalDocumentationObject;
}
export interface OpenAPIComponents extends OpenAPIV3.ComponentsObject {
  validateRequest?: boolean;
  validateResponse?: boolean;
  swaggerVersion: string;
  apiVersion: string;
}
export type Document = OpenAPIV2Document | OpenAPIV3Document;
export type PathsObject = OpenAPIV2.PathsObject | OpenAPIV3.PathsObject;
export type PathItemObject = OpenAPIV2.PathItemObject | OpenAPIV3.PathItemObject;

// Generic
export interface LocationError {
  path: string;
  location: string;
  message: string;
  errorCode: string;
}
export interface ValidationErrorJSON extends Error {
  errors: LocationError[];
  statusCode: number;
  response: any;
}
export interface IValidationError extends Error {
  errors: LocationError[];
  statusCode: number;
  response: any;
  toJSON: () => ValidationErrorJSON;
}

export interface Logger {
  fatal(msg: string, ...args: any[]): void;
  fatal(obj: {}, msg?: string, ...args: any[]): void;
  error(msg: string, ...args: any[]): void;
  error(obj: {}, msg?: string, ...args: any[]): void;
  warn(msg: string, ...args: any[]): void;
  warn(obj: {}, msg?: string, ...args: any[]): void;
  info(msg: string, ...args: any[]): void;
  info(obj: {}, msg?: string, ...args: any[]): void;
  debug(msg: string, ...args: any[]): void;
  debug(obj: {}, msg?: string, ...args: any[]): void;
  trace(msg: string, ...args: any[]): void;
  trace(obj: {}, msg?: string, ...args: any[]): void;
  child: (bindings: Bindings) => Logger;
}

// BautaJS
export interface BautaJSOptions<TRaw = any> {
  /**
   * Get the request object from the passed data on the Operation.run method.
   * It's used to get the data for the request validation.
   *
   * @template TRaw object send on operation.run method
   * @param {RawData<TRaw>} data
   * @return {Request}
   * @memberof BautaJSOptions
   */
  getRequest?(raw: RawData<TRaw>): Request;
  /**
   * Get the response object from the passed data on the Operation.run method.
   * It's used to get the request status and statusCode to determine the response validation.
   *
   * @template TRaw object send on operation.run method
   * @param {RawData<TRaw>} data
   * @return { isResponseFinished: boolean; statusCode: number }
   * @memberof BautaJSOptions
   */
  getResponse?(raw: RawData<TRaw>): { isResponseFinished: boolean; statusCode: number };
  /**
   *
   * An array of resolvers to include into the bautajs core.
   * @type {Resolver[]}
   * @memberof BautaJSOptions
   */
  resolvers?: Resolver[];
  /**
   *
   * A glob path where to find the resolvers files. Will be ignore in case that resolvers is defined
   * @type {string | string[]}
   * @memberof BautaJSOptions
   */
  resolversPath?: string | string[];
  /**
   *
   * If set to true, all operation responses will be validated. This will be override for the local operation configuration.
   * @type {boolean}
   * @default false
   * @memberof BautaJSOptions
   */
  enableResponseValidation?: boolean;
  /**
   *
   * If set to true, all operation requests will be validated. This will be override for the local operation configuration.
   * @type {boolean}
   * @default true
   * @memberof BautaJSOptions
   */
  enableRequestValidation?: boolean;
  /**
   *
   *  The static context that will be available on all bautajs.staticConfig instance.
   * @type {any}
   * @memberof BautaJSOptions
   */
  staticConfig?: any;

  /**
   *  Custom logger defined by the user to be used by bautajs. If it is not specified default bautajs logger is used.
   *
   * @type {Logger}
   * @memberof BautaJSOptions
   */
  logger?: Logger;

  /**
   * Any request or response log message exceeding this size is truncated.
   *
   * @type {number}
   * @memberof BautaJSOptions
   */
  truncateLogSize?: number;

  /**
   * If set to true, it disables the truncate. If set to false or unset, the truncate of logs happens as usual.
   *
   * Note: in productive environments it is strongly recommended not to set this variable to true.
   *
   * @type {boolean}
   * @memberof BautaJSOptions
   */
  disableTruncateLog?: boolean;

  /**
   *
   *
   * @type {CustomValidationFormat[]}
   * @memberof BautaJSOptions
   */
  readonly customValidationFormats?: CustomValidationFormat[];
}

export interface BautaJSInstance {
  /**
   * The list of operations defined on the given OpenAPI schemas split by version ID's.
   *
   * @type {Operations}
   * @memberof BautaJSInstance
   */
  readonly operations: Operations;
  /**
   * An instance of the logger under bautajs scope. By default if non is provided a pino instance will be created
   *
   * @type {Logger}
   * @memberof BautaJSInstance
   */
  readonly logger: Logger;
  /**
   * The given OpenAPI definitions schemas.
   *
   * @type {Document[]}
   * @memberof BautaJSInstance
   */
  readonly apiDefinitions: Document[];
  /**
   * An static set of configurations available on each Pipeline.StepFunction.
   *
   * @type {*}
   * @memberof BautaJSInstance
   */
  readonly staticConfig: any;

  /**
   * Test
   *
   * @type {BautaJSOptions}
   * @memberof BautaJSInstance
   */
  readonly options: BautaJSOptions;

  /**
   * Run all async process such dereference the api definitions and build the operation validators. You can still use the bautaJS instance
   * without execute this method, but take in account that OpenAPI features such request or response validation won't be available.
   * @async
   * @memberof BautaJSInstance
   */
  bootstrap(): Promise<void>;
  /**
   * Decorate current BautaJSInstance with new properties
   * @memberof BautaJSInstance
   */
  decorate(name: string | symbol, fn: any, dependencies?: string[]): BautaJSInstance;
  [key: string]: any;

  readonly validator: Validator<Ajv.ValidateFunction>;
}

export type CustomValidationFormat = {
  name: string;
} & Ajv.FormatDefinition;

// Service
export type Operations = Dictionary<Version>;
export type Resolver = (operations: Operations) => void;

// Version
export type Version = Dictionary<Operation>;

// Operation
export interface Operation extends BasicOperation {
  route?: Route;
  schema?: OpenAPI.Operation;
  nextVersionOperation?: Operation;
  requestValidationEnabled: Boolean;
  responseValidationEnabled: Boolean;
  addRoute(route: Route): void;
  /**
   * Set the operation as deprecated. If the operation is deprecated the link between
   * the operations version will be broken, meaning that operations from new version won't
   * inherit this operation pipeline.
   * @returns {Operation}
   * @memberof Operation
   */
  setAsDeprecated(): Operation;
  /**
   * Get true if the pipeline is already setup for this operation
   * @memberof Operation
   */
  isSetup(): boolean;
  /**
   * Set request validation to true. This will validate all req.body, req.query and req.params.
   * @memberof Operation
   */
  validateRequest(toggle: boolean): Operation;
  /**
   * Set the response validation to true. This will validate the operation result againts the operation responses schemas.
   * @memberof Operation
   */
  validateResponse(toggle: boolean): Operation;
  /**
   * Setup a new handler for the operation.
   * Each time you setup a new handler if there was already an handler setup, it will be override.
   * @param {pipelineOrStep: Pipeline.StepFunction<undefined, any>} pipelineOrStep
   * @returns {Operation}
   * @memberof Operation
   */
  setup(step: Pipeline.StepFunction<undefined, any>): void;
  /**
   * Run the operation handler with the given context. It can return a promise or a value, it depends
   * on the handler you execute.
   *
   * @param {RawData} [ctx]
   * @template TOut
   * @returns {PCancelable<TOut> | TOut} A cancelable promise or a value
   * @memberof Operation
   */
  run<TRaw, TOut>(raw?: RawData<TRaw>): TOut | PCancelable<TOut>;
  /**
   * Set the operation as private. This will means that this operation will be
   * removed from the output swagger definition.
   * An operation is private by default, the only way to set as public is to setup a pipeline.
   * If you set as private an operation even though is setup, the operation will remain private.
   * @memberof Operation
   */
  setAsPrivate(): Operation;
  /**
   * Return if the operation is private or not.
   * @returns {boolean}
   * @memberof Operation
   */
  isPrivate(): boolean;
}
export type ValidationReqBuilder = (req?: Request) => void;
export type ValidationResBuilder = (res: any, statusCode?: number | string) => null;

export type RawData<T> = T & { log?: Logger; id?: string; url?: string; data?: Dictionary<any> };
export interface Context extends Session {
  /**
   * A cancelable token instance of the current pipeline. Use it to check if the pipeline
   * has been canceled or to subscribe to the onCancel event.
   *
   * @type {CancelableToken}
   * @memberof Context
   */
  token: CancelableToken;
  /**
   * Validate the given req.body, req.params and req.query with the given OpenAPI request schema for that operation ID.
   *
   * @type {ValidationReqBuilder}
   * @memberof Context
   */
  validateRequestSchema: ValidationReqBuilder;
  /**
   * Validate the given object against the specified OpenAPI response schema for current operation and the given status code.
   * If status code is not defined 'default' will be used.
   *
   * @type {ValidationResBuilder}
   * @memberof Context
   */
  validateResponseSchema: ValidationResBuilder;
  /**
   *  A dictionary to add custom data to pass between Pipeline.StepFunctions
   * @type {Dictionary<any>}
   * @memberof Context
   */
  data: Dictionary<any>;
}

export interface RawContext<TRaw = any> extends Context {
  /**
   *  Data passed through the method operation.run(). Normally used for frameworks plugin to add the req and res objects
   */
  raw: TRaw;
}

export interface Session {
  /**
   * An unique id generated each request.
   *
   * @type {string}
   * @memberof Session
   */
  id?: string | number;
  /**
   * An instance of the logger available to the session
   *
   * @type {Logger}
   * @memberof Session
   */
  log: Logger;
  /**
   * The url that is being requested.
   *
   * @type {(string | undefined)}
   * @memberof Session
   */
  url?: string;
}

export declare namespace Pipeline {
  interface CatchError<ErrorType> {
    (error: GenericError, ctx: Context, batuajs: BautaJSInstance): ErrorType;
  }
  interface StepFunction<ValueType, ReturnType> {
    (value: ValueType, ctx: Context, batuaJS: BautaJSInstance):
      | PromiseLike<ReturnType>
      | ReturnType;
  }
  interface PipelineFunction<ValueType, ReturnType> extends StepFunction<ValueType, ReturnType> {
    catchError: <ErrorType>(
      fn: CatchError<ErrorType>
    ) => StepFunction<ValueType, ReturnType | ErrorType>;
  }
}

export type OnCancel = () => void;

export interface CancelableToken {
  isCanceled: boolean;

  /**
   * Cancel the given pipeline execution triggering all onCancel listeners.
   *
   * @memberof CancelableToken
   */
  cancel(): void;

  /**
   * Listen to an onCancel event and execute the given function.
   *
   * @memberof CancelableToken
   */
  onCancel: (fn: OnCancel) => void;
}

export interface CancelablePromise<T> extends PCancelable<T> {}
