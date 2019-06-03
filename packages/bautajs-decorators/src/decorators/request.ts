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
import { GotEmitter, Response } from 'got';
import * as nodeStream from 'stream';
import {
  FullResponseRequestOptions,
  RequestOptions,
  StepFn,
  StreamRequestOptions
} from '@bautajs/core';

export interface RequestFn {
  request<TReq, TRes, TIn>(
    options?: RequestOptions
  ): StepFn<TReq, TRes, TIn, Buffer | string | object>;
  request<TReq, TRes, TIn>(
    options: FullResponseRequestOptions
  ): StepFn<TReq, TRes, TIn, Response<Buffer | string | object>>;
  request<TReq, TRes, TIn>(
    options: StreamRequestOptions
  ): StepFn<TReq, TRes, TIn, GotEmitter & nodeStream.Duplex>;
}

const requestFn: any = (options?: any): any => {
  return (prev: any, ctx: any) => {
    return ctx.dataSource(prev).request(options);
  };
};

const impl: RequestFn = {
  request: requestFn
};

/**
 * Compile the data source and do a request to the operation service
 * In the datasources all the ctx variables (ctx.req...) and ctx.previousValue will be available.
 * @export
 * @param {RequestOptions|OnlyBodyRequestOptions|StreamRequestOptions} [options]
 * @returns {Request}
 * @example
 * const { request } = require('@batuajs/decorators');
 *
 * services.v1.test.op1.setup(p => p.push(request()));
 */

export const { request } = impl;
export default impl.request;
