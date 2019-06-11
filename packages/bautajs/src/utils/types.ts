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
import { GotEmitter, GotOptions, GotPromise, Hooks } from 'got';
import { IncomingHttpHeaders } from 'http';
import { MultipartBody, RequestPart } from 'multipart-request-builder';
import { HttpProxy, HttpsProxy } from 'native-proxy-agent';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import * as nodeStream from 'stream';

// Generic
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export interface ICallback {
  (error?: Error | null, result?: any): void;
}
export interface Dictionary<T> {
  [key: string]: T;
}
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
  DATASOURCE_REQUEST = '3',
  DATASOURCE_RESPONSE = '4',
  EXPOSE_OPERATION = '5'
}
export interface Logger {
  debug: debug.Debugger;
  trace: debug.Debugger;
  log: debug.Debugger;
  info: debug.Debugger;
  warn: debug.Debugger;
  error: debug.Debugger;
  events: EventEmitter;
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
export type Document = OpenAPIV2Document | OpenAPIV3Document;
export type PathsObject = OpenAPIV2.PathsObject | OpenAPIV3.PathObject;
export type PathItemObject = OpenAPIV2.PathItemObject | OpenAPIV3.PathItemObject;

export enum ResponseType {
  JSON = 'json',
  BUFFER = 'buffer',
  TEXT = 'text'
}

// BautaJS
export interface BautaJSOptions<TReq, TRes> {
  dataSourcesPath?: string | string[];
  resolversPath?: string | string[];
  /**
   *
   *  The dataSource static context that will be use to do a first parse to the dataSource on run time.
   * @type {any}
   * @memberof BautaJSOptions
   */
  dataSourceStaticCtx?: any;
  /**
   *
   * Add service utils available on every resolver.
   * @type {(services: Services<TReq, TRes>) => any}
   * @memberof BautaJSOptions
   */
  servicesWrapper?: (services: Services<TReq, TRes>) => any;
}
export interface BautaJSBuilder<TReq, TRes> {
  readonly services: Services<TReq, TRes>;
  readonly logger: Logger;
  readonly apiDefinitions: Document[];
}

// Service
export type Services<TReq, TRes> = Dictionary<Service<TReq, TRes>>;
export type Service<TReq, TRes> = Dictionary<Version<TReq, TRes>>;
export interface ServiceTemplate {
  options?: RequestOptions;
  operations: OperationTemplate[];
}
export type Resolver<TReq, TRes> = (services: Services<TReq, TRes>, utils: any) => void;

// Version
export type Version<TReq, TRes> = Dictionary<Operation<TReq, TRes>>;

// Operation
export type ErrorHandler<TReq, TRes> = ((err: Error, ctx: Context<TReq, TRes>) => any);
export interface Operation<TReq, TRes> {
  private: boolean;
  schema: Document;
  nextVersionOperation: null | Operation<TReq, TRes>;
  readonly operationId: string;
  readonly serviceId: string;
  setErrorHandler(
    errorHandler: (err: Error, ctx: Context<TReq, TRes>) => any
  ): Operation<TReq, TRes>;
  validateRequest(toggle: boolean): Operation<TReq, TRes>;
  validateResponse(toggle: boolean): Operation<TReq, TRes>;
  setup(fn: (pipeline: Pipeline<TReq, TRes, undefined>) => void): Operation<TReq, TRes>;
  run(ctx?: ContextData<TReq, TRes>): Promise<any>;
}
export type ValidationReqBuilder<TReq> = (req?: TReq) => null;
export type ValidationResBuilder<TRes> = (res: TRes, statusCode?: number) => null;
export interface Metadata {
  version: string;
  serviceId: string;
  operationId: string;
}
export interface OperationTemplate {
  id: string;
  version?: string;
  private?: boolean;
  method?: string;
  url?: string;
  inherit?: boolean;
  options?: RequestOptions;
}
export interface RequestFn {
  (localOptions?: RequestOptions): Promise<Buffer | string | object>;
  (localOptions: FullResponseRequestOptions): GotPromise<Buffer | string | object>;
  (localOptions: StreamRequestOptions): GotEmitter & nodeStream.Duplex;
}
export interface OperationDataSource extends OperationTemplate {
  request: RequestFn;
}
export type OperationDataSourceBuilder = {
  template: OperationTemplate;
} & ((previousValue?: any) => OperationDataSource);
export interface ContextData<TReq, TRes> {
  req?: TReq;
  res?: TRes;
  data?: Dictionary<any>;
}
export interface Context<TReq, TRes> extends Session {
  req: TReq;
  res: TRes;
  validateRequest: ValidationReqBuilder<TReq>;
  validateResponse: ValidationResBuilder<TRes>;

  /**
   *
   *  The dataSource object where your request data is.
   * @type {OperationDataSourceBuilder}
   * @memberof Context
   */
  dataSource: OperationDataSourceBuilder;
  metadata: Metadata;

  /**
   *  A dictionary to add custom data to pass between steps
   * @type {Dictionary<any>}
   * @memberof Context
   */
  data: Dictionary<any>;
}
export interface CompiledContext<TReq, TRes, T> extends Omit<Context<TReq, TRes>, 'dataSource'> {
  dataSource: T;
}
export interface Session {
  id?: string;
  userId?: string;
  logger: Logger;
  url: string | undefined;
}

// Step
export type StepFn<TReq, TRes, TIn, TOut> = (
  prev: TIn,
  ctx: Context<TReq, TRes>
) => TOut | Promise<TOut>;
export interface Pipeline<TReq, TRes, TIn> {
  push<TOut>(fn: StepFn<TReq, TRes, TIn, TOut>): Pipeline<TReq, TRes, TOut>;
}
export interface HandlerAccesor<TReq, TRes> {
  handler: StepFn<TReq, TRes, any, any>;
}

// DataSource
export interface RequestOptions extends GotOptions<string | null> {
  body?: string | Buffer | nodeStream.Readable | object | Record<string, any>;
  form?: boolean | object;
  href?: string;
  headers?: IncomingHttpHeaders;
  responseType?: ResponseType;
  multipart?: RequestPart[] | MultipartBody;
  formData?: Dictionary<any>;
  json?: boolean | object;
  proxy?: HttpProxy | HttpsProxy;
  preambleCRLF?: boolean;
  postambleCRLF?: boolean;
  hooks?: Hooks<GotOptions<string | null>, object>;
  stream?: false;
  resolveBodyOnly?: true;
}
export interface StreamRequestOptions extends Omit<RequestOptions, 'stream'> {
  stream: true;
}
export interface FullResponseRequestOptions extends Omit<RequestOptions, 'resolveBodyOnly'> {
  resolveBodyOnly: false;
}
export interface NormalizedOptions extends GotOptions<any> {
  responseType?: ResponseType;
}
export interface DataSourceTemplate {
  services: Dictionary<ServiceTemplate>;
}
export interface DataSourceData<TReq, TRes, TIn> {
  previousValue: TIn;
  env: any;
  ctx: Context<TReq, TRes>;
}
