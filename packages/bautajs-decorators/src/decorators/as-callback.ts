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
import { promisify } from 'util';
import { Context, StepFn } from '@bautajs/core';

export type StepFnCallback<TReq, TRes, TIn, TOut> = (
  prev: TIn,
  ctx: Context<TReq, TRes>,
  callback: (err: Error | null, val: TOut) => void
) => void;

/**
 * Allow you to use a callback style async operation
 * @export
 * @template TReq
 * @template TRes
 * @template TIn
 * @template TOut
 * @param {StepFnCallback<TReq, TRes, TIn, TOut>} fn
 * @returns {StepFn<TReq, TRes, TIn, TOut>}
 * @example
 * const { asCallback } = require('@batuajs/decorators');
 *
 * services.v1.test.op1.setup(p => p.push(asCallback((_, ctx, done) => {
 *  done(null, 'hey')
 * })))
 */
export function asCallback<TReq, TRes, TIn, TOut>(
  fn: StepFnCallback<TReq, TRes, TIn, TOut>
): StepFn<TReq, TRes, TIn, TOut> {
  return promisify<TIn, Context<TReq, TRes>, TOut>(fn);
}

export default asCallback;
