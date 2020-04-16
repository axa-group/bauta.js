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
import { OperatorFunction } from '../types';

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
