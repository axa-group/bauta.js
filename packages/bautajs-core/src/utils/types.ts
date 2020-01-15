/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { EventEmitter } from 'events';
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import PCancelable from 'p-cancelable';

export type JSONSchema = any;

export interface Response {
  [code: number]: JSONSchema;
  [code: string]: JSONSchema;
}

export interface RouteSchema {
  body?: JSONSchema;
  querystring?: JSONSchema;
  params?: JSONSchema;
  headers?: JSONSchema;
  response?: Response;
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

export type Generic = Omit<OpenAPI.Document, 'paths'> & { basePath?: string };

export interface DocumentParsed {
  generic: Generic;
  routes: Route[];
}

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
  /**
   * Set request validation to true. This will validate all req.body, req.query and req.params.
   * @memberof Operation
   */
  validateRequest?: boolean;
  /**
   * Set the response validation to true. This will validate the operation result againts the operation responses schemas.
   * @memberof Operation
   */
  validateResponse?: boolean;
}
export interface OpenAPIV3Document extends OpenAPIV3.Document {
  /**
   * Set request validation to true. This will validate all req.body, req.query and req.params.
   * @memberof Operation
   */
  validateRequest?: boolean;
  /**
   * Set the response validation to true. This will validate the operation result againts the operation responses schemas.
   * @memberof Operation
   */
  validateResponse?: boolean;
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
export enum EventTypes {
  /**
   * An OperatorFunction has been pushed to some pipeline
   */
  PUSH_OPERATOR = '1',
  /**
   * An operation was registered on bautajs.
   */
  REGISTER_OPERATION = '2'
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
  /**
   * The list of operations defined on the given OpenAPI schemas split by version ID's.
   *
   * @type {Operations}
   * @memberof BautaJSInstance
   */
  readonly operations: Operations;
  /**
   * An instance of the logger under bautajs scope.
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
   * An static set of configurations available on each OperatorFunction.
   *
   * @type {*}
   * @memberof BautaJSInstance
   */
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
  readonly route: Route;
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
  /**
   * Set request validation to true. This will validate all req.body, req.query and req.params.
   * @deprecated use validateRequest instead
   * @memberof Operation
   */
  validateRequests(toggle: boolean): Operation;
  /**
   * Set the response validation to true. This will validate the operation result againts the operation responses schemas.
   * @deprecated use validateResponse instead
   * @memberof Operation
   */
  validateResponses(toggle: boolean): Operation;
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
   * Setup a new pipeline for the operation.
   * Each time you setup a pipeline if there is already a pipeline setup it will be overrided.
   * @param {(pipeline: Pipeline<undefined>) => void} fn
   * @returns {Operation}
   * @memberof Operation
   */
  setup(pipelineSetup: PipelineSetup<undefined>): void;
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
export type ValidationResBuilder = (res: any, statusCode?: number | string) => null;

export interface ContextData {
  /**
   * The request object of the used framework
   *
   * @type {TRequest}
   * @memberof ContextData
   */
  req?: TRequest;
  /**
   * The response object of the used framework.
   *
   * @type {TResponse}
   * @memberof ContextData
   */
  res?: TResponse;
  /**
   *  A dictionary to add custom data to pass between OperatorFunctions
   * @type {Dictionary<any>}
   * @memberof Context
   */
  data?: Dictionary<any>;
}
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
   * The request object of the used framework
   *
   * @type {TRequest}
   * @memberof Context
   */
  req: TRequest;
  /**
   * The response object of the used framework.
   *
   * @type {TResponse}
   * @memberof Context
   */
  res: TResponse;
  /**
   * Validate the given req.body, req.params and req.query with the given OpenAPI request schema for that operation ID.
   *
   * @type {ValidationReqBuilder}
   * @memberof Context
   */
  validateRequest: ValidationReqBuilder;
  /**
   * Validate the given response against the specified OpenAPI response schema for that operation ID.
   *
   * @type {ValidationResBuilder}
   * @memberof Context
   * @deprecated use validateResponseSchema
   */
  validateResponse: ValidationResBuilder;
  /**
   * Validate the given object against the specified OpenAPI response schema for current operation and the given status code.
   * If status code is not defined 'default' will be used.
   *
   * @type {ValidationResBuilder}
   * @memberof Context
   */
  validateResponseSchema: ValidationResBuilder;
  /**
   *  A dictionary to add custom data to pass between OperatorFunctions
   * @type {Dictionary<any>}
   * @memberof Context
   */
  data: Dictionary<any>;
}

export interface Session {
  /**
   * An unique id generated each request.
   *
   * @type {string}
   * @memberof Session
   */
  id?: string;
  /**
   * A hash of the request AUTHORIZATION token representing the userId.
   *
   * @type {string}
   * @memberof Session
   */
  userId?: string;
  /**
   * An instance of the logger with the id and userId scopes.
   *
   * @type {ContextLogger}
   * @memberof Session
   */
  logger: ContextLogger;
  /**
   * The url that is being requested.
   *
   * @type {(string | undefined)}
   * @memberof Session
   */
  url: string | undefined;
}

// @deprecated "use OperatorFunction instead"
export type StepFn<TIn, TOut> = (
  /**
   * The previous value returned by the previous operator executed.
   */
  prev: TIn,
  /**
   * The request context.
   */
  ctx: Context,
  /**
   * The bautajs instance.
   */
  bautajs: BautaJSInstance
) => TOut | Promise<TOut>;

export type OperatorFunction<TIn, TOut> = StepFn<TIn, TOut>;

export interface PipelineBuilder<TIn> {
  /**
   * Create a pipeline of OperatorFunction. It allows merge pipelines.
   *
   * @param {...OperatorFunction<TIn, TOut>} ...fns
   * @returns {PipelineBuilder<TOut>}
   * @memberof PipelineBuilder
   * @example
   * const { pipeline } = require('@bautajs/core');
   *
   * const pipelineOne = pipeline(p => p.pipe(() => 'result'));
   * pipeline(p => p.pipe(() => 'some convertion', pipelineOne));
   */
  pipe<A>(op1: OperatorFunction<TIn, A>): PipelineBuilder<A>;
  pipe<A, B>(op1: OperatorFunction<TIn, A>, op2: OperatorFunction<A, B>): PipelineBuilder<B>;
  pipe<A, B, C>(
    op1: OperatorFunction<TIn, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>
  ): PipelineBuilder<C>;
  pipe<A, B, C, D>(
    op1: OperatorFunction<TIn, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>
  ): PipelineBuilder<D>;
  pipe<A, B, C, D, E>(
    op1: OperatorFunction<TIn, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>
  ): PipelineBuilder<E>;
  pipe<A, B, C, D, E, F>(
    op1: OperatorFunction<TIn, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>
  ): PipelineBuilder<F>;
  pipe<A, B, C, D, E, F, G>(
    op1: OperatorFunction<TIn, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>
  ): PipelineBuilder<G>;
  pipe<A, B, C, D, E, F, G, H>(
    op1: OperatorFunction<TIn, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>
  ): PipelineBuilder<H>;
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<TIn, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>
  ): PipelineBuilder<I>;
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<TIn, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>,
    ...operations: OperatorFunction<any, any>[]
  ): PipelineBuilder<any>;
  /**
   * Push an OperatorFunction to the pipeline.
   *
   * @template TOut
   * @deprecated Use .pipe instead
   * @param {OperatorFunction<TIn, TOut>} fn
   * @returns {PipelineBuilder<TOut>}
   * @memberof PipelineBuilder
   */
  push<TOut>(fn: OperatorFunction<TIn, TOut>): PipelineBuilder<TOut>;
  /**
   * Merge the given pipeline with the current pipeline.
   *
   * @template TOut
   * @deprecated Use .pipe instead
   * @param {(pipeline: Pipeline<TIn, TOut>) => void} fn
   * @returns {PipelineBuilder<TOut>}
   * @memberof PipelineBuilder
   */
  pushPipeline<TOut>(fn: OperatorFunction<TIn, TOut>): PipelineBuilder<TOut>;

  /**
   * Set a behaviour in case that some of the pipeline steps throws an error or rejects a promise.
   *
   * @param {ErrorHandler} fn
   * @memberof PipelineBuilder
   */
  onError(fn: ErrorHandler): void;
}

export type PipelineSetup<TIn> = (pipeline: PipelineBuilder<TIn>) => void;

/**
 * Resolve the given predicate an execute the pipeline for that condition
 *
 * @export
 * @interface Match
 * @template TIn
 * @template TOut
 */
export interface Match<TIn, TOut> {
  pipeline?: OperatorFunction<TIn, TOut>;
  /**
   * Set a predicate function that have to return true or false. Depending on that resolution the
   * given pipeline will be executed.
   *
   * @param {(prev: TIn, ctx: Context, bautajs: BautaJSInstance) => boolean} pred
   * @param {OperatorFunction<TIn, TOut>} pipeline
   * @returns {Match<TIn, TOut>}
   * @memberof Match
   */
  on(
    pred: (prev: TIn, ctx: Context, bautajs: BautaJSInstance) => boolean,
    pipeline: OperatorFunction<TIn, TOut>
  ): Match<TIn, TOut>;
  /**
   * Set the pipeline that will be executed by default if any of the given predicates succed.
   *
   * @param {OperatorFunction<TIn, TOut>} pipeline
   * @memberof Match
   */
  otherwise(pipeline: OperatorFunction<TIn, TOut>): void;
}

export interface HandlerAccesor {
  handler: OperatorFunction<any, any>;
  errorHandler: ErrorHandler;
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
