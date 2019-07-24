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
import { BautaJSInstance, Context, StepFn } from '@bautajs/core';
import { Dictionary } from '@bautajs/environment';

export enum ResponseType {
  JSON = 'json',
  BUFFER = 'buffer',
  TEXT = 'text'
}

export interface RestProviderTemplate<TOptions> {
  id: string;
  options?: TOptions;
}

export interface RequestFn {
  (localOptions?: RequestOptions): Promise<Buffer | string | object>;
  (localOptions: FullResponseRequestOptions): GotPromise<Buffer | string | object>;
  (localOptions: StreamRequestOptions): GotEmitter & nodeStream.Duplex;
}

export interface RequestDecorator<TIn> {
  (localOptions?: RequestOptions): StepFn<TIn, Buffer | string | object>;
  (localOptions: FullResponseRequestOptions): StepFn<TIn, Response<Buffer | string | object>>;
  (localOptions: StreamRequestOptions): StepFn<TIn, GotEmitter & nodeStream.Duplex>;
}

export interface CompiledRestProvider extends RestProviderTemplate<RequestParams> {
  request: RequestFn;
}

export type RestProvider<TIn> = RequestDecorator<TIn> & {
  compile: (fn: StepFnCompiled<TIn, any>) => StepFn<TIn, any>;
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
export interface RestDataSourceTemplate<TOptions> {
  /**
   * A generic GOT options for your providers, this will be merged with the local provider options giving priority to the local ones.
   * @type {TOptions}
   * @memberof RestServiceTemplate
   */
  options?: TOptions;
  providers: RestProviderTemplate<TOptions>[];
}

export type RestDataSource<TIn> = Dictionary<RestProvider<TIn>>;

export type Options<TIn, TOut> =
  | ((value: TIn, ctx: Context, $static: any, $env: Dictionary<any>) => TOut)
  | RequestParams;

export type StepFnCompiled<TIn, TOut> = (
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
