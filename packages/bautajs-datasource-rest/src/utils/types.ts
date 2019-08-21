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
import { GotEmitter, GotOptions, GotPromise, Hooks, Response } from 'got';
import { MultipartBody, RequestPart } from 'multipart-request-builder';
import * as nodeStream from 'stream';
import { BautaJSInstance, Context, OperatorFunction, Dictionary } from '@bautajs/core';

export enum EventTypes {
  /**
   * A datasource was executed with the given options.
   */
  DATASOURCE_EXECUTION = '3',
  /**
   * A datasource execution finished with the given result.
   */
  DATASOURCE_RESULT = '4'
}

export enum ResponseType {
  JSON = 'json',
  BUFFER = 'buffer',
  TEXT = 'text'
}

export interface RestProviderTemplate<TOptions> {
  id?: string;
  options: TOptions;
}

export interface RestProviderTemplateWithId<TOptions> {
  id: string;
  options?: TOptions;
}

export interface RequestFn {
  (localOptions?: RequestOptions): Promise<Buffer | string | object>;
  (localOptions: FullResponseRequestOptions): GotPromise<Buffer | string | object>;
  (localOptions: StreamRequestOptions): GotEmitter & nodeStream.Duplex;
}

export interface RequestDecorator<TIn> {
  (localOptions?: RequestOptions): OperatorFunction<TIn, Buffer | string | object>;
  (localOptions: FullResponseRequestOptions): OperatorFunction<
    TIn,
    Response<Buffer | string | object>
  >;
  (localOptions: StreamRequestOptions): OperatorFunction<TIn, GotEmitter & nodeStream.Duplex>;
}

export interface CompiledRestProvider extends RestProviderTemplate<RequestParams> {
  request: RequestFn;
}

export type RestProvider<TIn> = RequestDecorator<TIn> & {
  compile: (fn: OperatorFunctionCompiled<TIn, any>) => OperatorFunction<TIn, any>;
};

// DataSource
export interface RequestOptions extends GotOptions<string | null> {
  body?: string | Buffer | nodeStream.Readable | object | Record<string, any>;
  form?: boolean | object;
  href?: string;
  responseType?: ResponseType;
  multipart?: RequestPart[] | MultipartBody;
  formData?: Dictionary<any> | string;
  json?: boolean | object | string;
  preambleCRLF?: boolean;
  postambleCRLF?: boolean;
  hooks?: Hooks<GotOptions<string | null>, object>;
  stream?: false;
  resolveBodyOnly?: true;
}
export interface RequestParams extends RequestOptions {
  url?: string;
  method?: string;
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
export interface RestDataSourceTemplate<TOptions, TGlobalOptions> {
  /**
   * A generic GOT options for your providers, this will be merged with the local provider options giving priority to the local ones.
   * @type {TOptions}
   * @type {TGlobalOptions}
   * @memberof RestServiceTemplate
   */
  options?: TGlobalOptions;
  providers: RestProviderTemplateWithId<TOptions>[];
}

export type RestDataSource<TIn> = Dictionary<RestProvider<TIn>>;

export type Options<TIn, TOut> =
  | ((value: TIn, ctx: Context, $static: any, $env: Dictionary<any>) => TOut)
  | TOut;

export type OperatorFunctionCompiled<TIn, TOut> = (
  prev: TIn,
  ctx: Context,
  bautajs: BautaJSInstance,
  provider: CompiledRestProvider
) => TOut | Promise<TOut>;

export interface RequestLog {
  url: string | undefined;
  method: string | undefined;
  headers: string;
  body?: string;
}
