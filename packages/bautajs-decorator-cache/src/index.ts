/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
    normalizer
  });
  return async (value: TIn, ctx: Context, bautajs: BautaJSInstance) => cached(value, ctx, bautajs);
};

export default cache;
