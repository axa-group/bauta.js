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
import memoizee from 'memoizee';
import { BautaJSInstance, Context, OperatorFunction } from '@bautajs/core';

export type Normalizer<TIn> = (value: [TIn, Context, BautaJSInstance]) => any;

export interface CacheDecorator {
  <TIn, TOut>(
    fn: OperatorFunction<TIn, TOut>,
    normalizer: Normalizer<TIn>,
    options?: memoizee.Options
  ): OperatorFunction<TIn, TOut>;
}

/**
 * Cache the given OperatorFunctions with [memoizee](https://www.npmjs.com/package/memoizee)
 * @export
 * @template TIn
 * @param {OperatorFunction<TIn, TOut>} fn
 * @param {Normalizer<TIn>} normalizer
 * @param {memoizee.Options} [options={}]
 * @returns {OperatorFunction<TIn, any>}
 * @example
 * const { cache } = require('@batuajs/cache-decorator');
 *
 * operations.v1.op1.setup(p => p.push(cache([() => {...}], ([_,ctx] => ctx.data.token))))
 */
// eslint-disable-next-line import/export
export const cache: CacheDecorator = <TIn, TOut>(
  fn: any,
  normalizer: Normalizer<TIn>,
  options: memoizee.Options = {}
): OperatorFunction<TIn, TOut> => {
  if (!normalizer) {
    throw new Error(
      'normalizer: (args)=>{} function is a mandatory parameter to calculate the cache key'
    );
  }
  const cached = memoizee(fn, {
    ...options,
    normalizer,
    promise: true
  });

  return async (value: TIn, ctx: Context, bautajs: BautaJSInstance) => cached(value, ctx, bautajs);
};

export default cache;
