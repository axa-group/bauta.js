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
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import { Dictionary, TRequest, TResponse } from '@bautajs/environment';

export * from '@bautajs/environment';
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
export interface Logger {
  debug: debug.Debugger;
  trace: debug.Debugger;
  log: debug.Debugger;
  info: debug.Debugger;
  warn: debug.Debugger;
  error: debug.Debugger;
  events: EventEmitter;
}

export enum ResponseType {
  JSON = 'json',
  BUFFER = 'buffer',
  TEXT = 'text'
}

// BautaJS
export interface BautaJSOptions {
  dataSourcesPath?: string | string[];
  resolversPath?: string | string[];
  /**
   *
   *  The dataSource static context that will be use to do a first parse to the dataSource on run time.
   * @type {any}
   * @memberof BautaJSOptions
   */
  dataSourceStatic?: any;
  /**
   *
   * Add service utils available on every resolver.
   * @type {(services: Services) => any}
   * @memberof BautaJSOptions
   */
  servicesWrapper?: (services: Services) => any;
}
export interface BautaJSInstance {
  readonly services: Services;
  readonly logger: Logger;
  readonly apiDefinitions: Document[];
}

// Service
export type Services = Dictionary<Service>;
export type Service = Dictionary<Version>;
export interface ServiceTemplate<TIn> {
  operations: OperationTemplate<TIn, any>[];
}
export type Resolver = (services: Services, utils: any) => void;

// Version
export type Version = Dictionary<Operation>;

// Operation
export type ErrorHandler = ((err: Error, ctx: Context) => any);
export interface Operation {
  private: boolean;
  schema: Document;
  nextVersionOperation: null | Operation;
  readonly operationId: string;
  readonly serviceId: string;
  dataSourceBuilder: OperationDataSourceBuilder<any>;
  setErrorHandler(errorHandler: (err: Error, ctx: Context) => any): Operation;
  validateRequest(toggle: boolean): Operation;
  validateResponse(toggle: boolean): Operation;
  setup(fn: (pipeline: Pipeline<undefined>) => void): Operation;
  run(ctx?: ContextData): Promise<any>;
}
export type ValidationReqBuilder = (req?: TRequest) => null;
export type ValidationResBuilder = (res: TResponse, statusCode?: number) => null;
export interface Metadata {
  version: string;
  serviceId: string;
  operationId: string;
}
export interface OperationTemplate<TIn, TOut> {
  id: string;
  version?: string;
  private?: boolean;
  inherit?: boolean;
  staticData?: any;
  runner: Runner<TIn, TOut>;
}
export type OperationDataSourceBuilder<TIn> = {
  template: OperationTemplate<TIn, any>;
} & ((previousValue?: any) => any);

export interface ContextData {
  req?: TRequest;
  res?: TResponse;
  data?: Dictionary<any>;
}
export interface Context extends Session {
  req: TRequest;
  res: TResponse;
  validateRequest: ValidationReqBuilder;
  validateResponse: ValidationResBuilder;

  /**
   *
   *  The dataSource object where your request data is.
   * @type {OperationDataSourceBuilder}
   * @memberof Context
   */
  dataSourceBuilder: OperationDataSourceBuilder<any>;
  metadata: Metadata;

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
  logger: Logger;
  url: string | undefined;
}

// Step
export type StepFn<TIn, TOut> = (
  prev: TIn,
  ctx: Context,
  bautajs: BautaJSInstance
) => TOut | Promise<TOut>;
export interface Pipeline<TIn> {
  push<TOut>(fn: StepFn<TIn, TOut>): Pipeline<TOut>;
}
export interface HandlerAccesor {
  handler: StepFn<any, any>;
}

// DataSource
export interface DataSourceTemplate<TIn> {
  services: Dictionary<ServiceTemplate<TIn>>;
}

export type Runner<TIn, TOut> = (
  value: TIn,
  ctx: Context,
  $static: any,
  $env: Dictionary<any>,
  bautajs: BautaJSInstance
) => TOut;
