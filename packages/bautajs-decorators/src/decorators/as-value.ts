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
import { StepFn } from '@bautajs/core';

/**
 *
 * Allow to pass directly a value to the resolver
 * @export
 * @template TReq
 * @template TRes
 * @template TIn
 * @template TOut
 * @param {TOut} someValue
 * @returns {StepFn<TReq, TRes, TIn, TOut>}
 * @example
 * const { asValue } = require('@batuajs/decorators');
 *
 * services.v1.test.op1.setup(p => p.push(asValue(5)))
 */
export function asValue<TReq, TRes, TIn, TOut>(someValue: TOut): StepFn<TReq, TRes, TIn, TOut> {
  return (): TOut => someValue;
}

export default asValue;
