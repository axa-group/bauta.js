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
import { BautaJSInstance, Context, GenericError, Pipeline } from '../types';

export type StepFunctionCallback<TIn, TOut> = (
  prev: TIn,
  ctx: Context,
  bautajs: BautaJSInstance,
  callback: (err: GenericError, val: TOut) => void
) => void;

/**
 * Allow you to use a callback style async operation
 * @export
 * @template TIn
 * @template TOut
 * @param {StepFunctionCallback<TIn, TOut>} fn
 * @returns {Pipeline.StepFunction<TIn, TOut>}
 * @example
 * const { asPromise } = require('@batuajs/core');
 *
 * operations.v1.op1.setup(asPromise((_, ctx, batuajs, done) => {
 *  done(null, 'hey')
 * }))
 */
export function asPromise<TIn, TOut>(
  fn: StepFunctionCallback<TIn, TOut>
): Pipeline.StepFunction<TIn, Promise<TOut>> {
  return promisify<TIn, Context, BautaJSInstance, TOut>(fn);
}

export default asPromise;
