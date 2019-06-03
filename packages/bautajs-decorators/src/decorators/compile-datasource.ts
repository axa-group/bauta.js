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
import { Context, Omit, OperationDataSource, StepFn } from '@bautajs/core';

export interface CompiledContext<TReq, TRes> extends Omit<Context<TReq, TRes>, 'dataSource'> {
  dataSource: OperationDataSource;
}
export type StepFnCompiled<TReq, TRes, TIn, TOut> = (
  prev: TIn,
  ctx: CompiledContext<TReq, TRes>
) => TOut | Promise<TOut>;

/**
 * Compile the ctx data source with the given request, resolving all the data source variables
 * In your function you can access to the compiled data source throught ctx.dataSource and do a request using
 * ctx.dataSource.request();
 * In the datasources all the ctx variables (ctx.req...) and ctx.previousValue will be available.
 * @export
 * @template TReq
 * @template TRes
 * @template TIn
 * @template TOut
 * @param {StepFnCompiled<TReq, TRes, TIn, TOut>} fn
 * @returns {StepFn<TReq, TRes, TIn, TOut>}
 * @example
 * const { compileDataSource } = require('@batuajs/decorators');
 *
 * services.v1.test.op1.setup(p => p.push(compileDataSource((_, ctx) => {
 *   return ctx.dataSource.request();
 * })))
 */
export function compileDataSource<TReq, TRes, TIn, TOut>(
  fn: StepFnCompiled<TReq, TRes, TIn, TOut>
): StepFn<TReq, TRes, TIn, TOut> {
  return (value: TIn, ctx: Context<TReq, TRes>): Promise<TOut> | TOut => {
    return fn(value, {
      ...ctx,
      dataSource: ctx.dataSource(value)
    });
  };
}

export default compileDataSource;
