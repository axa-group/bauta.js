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
import { EventEmitter } from 'events';
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import PCancelable from 'p-cancelable';

export interface Dictionary<T> {
  [key: string]: T;
}
export interface TRequest {
  [key: string]: any;
}
export interface TResponse {
  [key: string]: any;
}

// OpenAPI document
export interface OpenAPIV2Document extends OpenAPIV2.Document {
  validateRequest?: boolean;
  validateResponse?: boolean;
}
export interface OpenAPIV3Document extends OpenAPIV3.Document {
  validateRequest?: boolean;
  validateResponse?: boolean;
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
export enum EventTypes {
  PUSH_STEP = '1',
  REGISTER_SERVICE = '2',
  DATASOURCE_EXECUTION = '3',
  DATASOURCE_RESULT = '4',
  EXPOSE_OPERATION = '5'
}
export type Log = (...args: any[]) => any;
export interface Logger {
  debug: Log;
  trace: Log;
  log: Log;
  info: Log;
  warn: Log;
  error: Log;
  events: EventEmitter;
  create: (namespace: string) => ContextLogger;
}

export interface ContextLogger extends Omit<Logger, 'create'> {}

// BautaJS
export interface BautaJSOptions {
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
   *  The static context that will be use to do a first parse to the dataSource on run time.
   * @type {any}
   * @memberof BautaJSOptions
   */
  staticConfig?: any;
}
export interface BautaJSInstance {
  readonly operations: Operations;
  readonly logger: Logger;
  readonly apiDefinitions: Document[];
  readonly staticConfig: any;
}

// Service
export type Operations = Dictionary<Version>;
export type Resolver = (operations: Operations) => void;

// Version
export type Version = Dictionary<Operation>;

// Operation
export type ErrorHandler = (err: Error, ctx: Context) => any;
export interface Operation {
  readonly id: string;
  readonly version: string;
  readonly deprecated: boolean;
  schema: OpenAPI.Operation;
  nextVersionOperation?: Operation;
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
  validateRequests(toggle: boolean): Operation;
  validateResponses(toggle: boolean): Operation;
  /**
   * Setup a new pipeline for the operation.
   * Each time you setup a pipeline if there is already a pipeline setup it will be overrided.
   * @param {(pipeline: Pipeline<undefined>) => void} fn
   * @returns {Operation}
   * @memberof Operation
   */
  setup(fn: (pipeline: Pipeline<undefined>) => void): void;
  /**
   * Run the operation pipeline chain with the given context
   * @param {ContextData} [ctx]
   * @returns {PCancelable<any>}
   * @memberof Operation
   */
  run(ctx?: ContextData): PCancelable<any>;
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
export type ValidationReqBuilder = (req?: TRequest) => null;
export type ValidationResBuilder = (res: TResponse, statusCode?: number) => null;

export interface ContextData {
  req?: TRequest;
  res?: TResponse;
  data?: Dictionary<any>;
}
export interface Context extends Session {
  token: CancelableToken;
  req: TRequest;
  res: TResponse;
  validateRequest: ValidationReqBuilder;
  validateResponse: ValidationResBuilder;
  /**
   *  A dictionary to add custom data to pass between steps
   * @type {Dictionary<any>}
   * @memberof Context
   */
  data: Dictionary<any>;
}

export interface Session {
  id?: string;
  userId?: string;
  logger: ContextLogger;
  url: string | undefined;
}

// Step
export type StepFn<TIn, TOut> = (
  prev: TIn,
  ctx: Context,
  bautajs: BautaJSInstance
) => TOut | Promise<TOut>;

export interface Pipeline<TIn> {
  /**
   * Push an step function to the pipeline.
   * @template TOut
   * @param {StepFn<TIn, TOut>} fn
   * @returns {Pipeline<TOut>}
   * @memberof Pipeline
   */
  push<TOut>(fn: StepFn<TIn, TOut>): Pipeline<TOut>;
  /**
   * Merge the given pipeline with the current pipeline.
   * @template TOut
   * @param {(pipeline: Pipeline<TIn>) => void} fn
   * @returns {Pipeline<TOut>}
   * @memberof Pipeline
   */
  pushPipeline<TOut>(fn: (pipeline: Pipeline<TIn>) => void): Pipeline<TOut>;
  /**
   * Set a behaviour in case that some of the pipeline steps throws an error or rejects a promise.
   * @param {ErrorHandler} fn
   * @memberof Pipeline
   */
  onError(fn: ErrorHandler): void;
}

export interface HandlerAccesor {
  handler: StepFn<any, any>;
  errorHandler: ErrorHandler;
}

export type OnCancel = () => void;

export interface CancelableToken {
  isCanceled: boolean;

  cancel(): void;

  onCancel: (fn: OnCancel) => void;
}
