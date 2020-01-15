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
import { OperatorFunction } from '../utils/types';

export interface StaticParallel {
  parallel<TIn, TOut1, TOut2>(
    fn1: OperatorFunction<TIn, TOut1>,
    fn2: OperatorFunction<TIn, TOut2>
  ): OperatorFunction<TIn, [TOut1, TOut2]>;

  parallel<TIn, TOut1, TOut2, TOut3>(
    fn1: OperatorFunction<TIn, TOut1>,
    fn2: OperatorFunction<TIn, TOut2>,
    fn3: OperatorFunction<TIn, TOut3>
  ): OperatorFunction<TIn, [TOut1, TOut2, TOut3]>;

  parallel<TIn, TOut1, TOut2, TOut3, TOut4>(
    fn1: OperatorFunction<TIn, TOut1>,
    fn2: OperatorFunction<TIn, TOut2>,
    fn3: OperatorFunction<TIn, TOut3>,
    fn4: OperatorFunction<TIn, TOut4>
  ): OperatorFunction<TIn, [TOut1, TOut2, TOut3, TOut4]>;

  parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5>(
    fn1: OperatorFunction<TIn, TOut1>,
    fn2: OperatorFunction<TIn, TOut2>,
    fn3: OperatorFunction<TIn, TOut3>,
    fn4: OperatorFunction<TIn, TOut4>,
    fn5: OperatorFunction<TIn, TOut5>
  ): OperatorFunction<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5]>;

  parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6>(
    fn1: OperatorFunction<TIn, TOut1>,
    fn2: OperatorFunction<TIn, TOut2>,
    fn3: OperatorFunction<TIn, TOut3>,
    fn4: OperatorFunction<TIn, TOut4>,
    fn5: OperatorFunction<TIn, TOut5>,
    fn6: OperatorFunction<TIn, TOut6>
  ): OperatorFunction<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6]>;

  parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7>(
    fn1: OperatorFunction<TIn, TOut1>,
    fn2: OperatorFunction<TIn, TOut2>,
    fn3: OperatorFunction<TIn, TOut3>,
    fn4: OperatorFunction<TIn, TOut4>,
    fn5: OperatorFunction<TIn, TOut5>,
    fn6: OperatorFunction<TIn, TOut6>,
    fn7: OperatorFunction<TIn, TOut7>
  ): OperatorFunction<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7]>;

  parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8>(
    fn1: OperatorFunction<TIn, TOut1>,
    fn2: OperatorFunction<TIn, TOut2>,
    fn3: OperatorFunction<TIn, TOut3>,
    fn4: OperatorFunction<TIn, TOut4>,
    fn5: OperatorFunction<TIn, TOut5>,
    fn6: OperatorFunction<TIn, TOut6>,
    fn7: OperatorFunction<TIn, TOut7>,
    fn8: OperatorFunction<TIn, TOut8>
  ): OperatorFunction<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8]>;

  parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8, TOut9>(
    fn1: OperatorFunction<TIn, TOut1>,
    fn2: OperatorFunction<TIn, TOut2>,
    fn3: OperatorFunction<TIn, TOut3>,
    fn4: OperatorFunction<TIn, TOut4>,
    fn5: OperatorFunction<TIn, TOut5>,
    fn6: OperatorFunction<TIn, TOut6>,
    fn7: OperatorFunction<TIn, TOut7>,
    fn8: OperatorFunction<TIn, TOut8>,
    fn9: OperatorFunction<TIn, TOut9>
  ): OperatorFunction<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8, TOut9]>;

  parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8, TOut9, TOut10>(
    fn1: OperatorFunction<TIn, TOut1>,
    fn2: OperatorFunction<TIn, TOut2>,
    fn3: OperatorFunction<TIn, TOut3>,
    fn4: OperatorFunction<TIn, TOut4>,
    fn5: OperatorFunction<TIn, TOut5>,
    fn6: OperatorFunction<TIn, TOut6>,
    fn7: OperatorFunction<TIn, TOut7>,
    fn8: OperatorFunction<TIn, TOut8>,
    fn9: OperatorFunction<TIn, TOut9>,
    fn10: OperatorFunction<TIn, TOut10>
  ): OperatorFunction<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8, TOut9, TOut10]>;

  parallel<TIn>(...args: OperatorFunction<TIn, any>[]): OperatorFunction<TIn, any[]>;
}

const impl: StaticParallel = {
  /**
   * Execute the given async OperatorFunctions in parallel.
   *
   * @param {...any[]} args
   * @returns {*}
   * @example
   * const { getCats } = require('./my-datasource');
   *
   * operations.v1.op1.setup(p => p.push(
   *  parallel(
   *    getCats.compile((_, ctx, provider) => {
   *      return provider.request();
   *    })),
   *    getCats.compile((_, ctx, provider) => {
   *      return provider.request({id: 1});
   *    })
   *  )
   * ));
   */
  parallel(...args: any[]): any {
    return (...operatorFunctionArgs: any[]) =>
      Promise.all(
        args.map(fn => {
          const result = fn(...operatorFunctionArgs);
          if (result instanceof Promise) {
            return result;
          }

          return Promise.resolve(result);
        })
      );
  }
};

export default impl.parallel;
export const { parallel } = impl;
