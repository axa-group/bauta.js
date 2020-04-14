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
import { promisify } from 'util';
import { BautaJSInstance, Context } from '@bautajs/core';
import { CompiledRestProvider, OperatorFunctionCompiled } from '../utils/types';

export type OperatorFunctionCallback<TIn, TOut> = (
  prev: TIn,
  ctx: Context,
  bautajs: BautaJSInstance,
  provider: CompiledRestProvider,
  callback: (err: Error | null, val: TOut) => void
) => void;

/**
 * Allow you to use a callback style async operation on compiled datasource context
 * @export
 * @template TIn
 * @template TOut
 * @param {OperatorFunctionCallback<TIn, TOut>} fn
 * @returns {OperatorFunction<TIn, TOut>}
 * @example
 * const { asPromise } = require('@batuajs/datasource-rest');
 *+
 * operations.v1.op1.setup(p => p.push(asPromise((_, ctx, provider, batuajs, done) => {
 *  done(null, 'hey')
 * })))
 */
export function asPromise<TIn, TOut>(
  fn: OperatorFunctionCallback<TIn, TOut>
): OperatorFunctionCompiled<TIn, TOut> {
  return promisify<TIn, Context, BautaJSInstance, CompiledRestProvider, TOut>(fn);
}

export default asPromise;