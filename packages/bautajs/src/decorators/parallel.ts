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
import { StepFn } from '../utils/types';

export interface StaticParallel {
  parallel<TIn, TOut1, TOut2>(
    fn1: StepFn<TIn, TOut1>,
    fn2: StepFn<TIn, TOut2>
  ): StepFn<TIn, [TOut1, TOut2]>;

  parallel<TIn, TOut1, TOut2, TOut3>(
    fn1: StepFn<TIn, TOut1>,
    fn2: StepFn<TIn, TOut2>,
    fn3: StepFn<TIn, TOut3>
  ): StepFn<TIn, [TOut1, TOut2, TOut3]>;

  parallel<TIn, TOut1, TOut2, TOut3, TOut4>(
    fn1: StepFn<TIn, TOut1>,
    fn2: StepFn<TIn, TOut2>,
    fn3: StepFn<TIn, TOut3>,
    fn4: StepFn<TIn, TOut4>
  ): StepFn<TIn, [TOut1, TOut2, TOut3, TOut4]>;

  parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5>(
    fn1: StepFn<TIn, TOut1>,
    fn2: StepFn<TIn, TOut2>,
    fn3: StepFn<TIn, TOut3>,
    fn4: StepFn<TIn, TOut4>,
    fn5: StepFn<TIn, TOut5>
  ): StepFn<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5]>;

  parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6>(
    fn1: StepFn<TIn, TOut1>,
    fn2: StepFn<TIn, TOut2>,
    fn3: StepFn<TIn, TOut3>,
    fn4: StepFn<TIn, TOut4>,
    fn5: StepFn<TIn, TOut5>,
    fn6: StepFn<TIn, TOut6>
  ): StepFn<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6]>;

  parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7>(
    fn1: StepFn<TIn, TOut1>,
    fn2: StepFn<TIn, TOut2>,
    fn3: StepFn<TIn, TOut3>,
    fn4: StepFn<TIn, TOut4>,
    fn5: StepFn<TIn, TOut5>,
    fn6: StepFn<TIn, TOut6>,
    fn7: StepFn<TIn, TOut7>
  ): StepFn<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7]>;

  parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8>(
    fn1: StepFn<TIn, TOut1>,
    fn2: StepFn<TIn, TOut2>,
    fn3: StepFn<TIn, TOut3>,
    fn4: StepFn<TIn, TOut4>,
    fn5: StepFn<TIn, TOut5>,
    fn6: StepFn<TIn, TOut6>,
    fn7: StepFn<TIn, TOut7>,
    fn8: StepFn<TIn, TOut8>
  ): StepFn<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8]>;

  parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8, TOut9>(
    fn1: StepFn<TIn, TOut1>,
    fn2: StepFn<TIn, TOut2>,
    fn3: StepFn<TIn, TOut3>,
    fn4: StepFn<TIn, TOut4>,
    fn5: StepFn<TIn, TOut5>,
    fn6: StepFn<TIn, TOut6>,
    fn7: StepFn<TIn, TOut7>,
    fn8: StepFn<TIn, TOut8>,
    fn9: StepFn<TIn, TOut9>
  ): StepFn<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8, TOut9]>;

  parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8, TOut9, TOut10>(
    fn1: StepFn<TIn, TOut1>,
    fn2: StepFn<TIn, TOut2>,
    fn3: StepFn<TIn, TOut3>,
    fn4: StepFn<TIn, TOut4>,
    fn5: StepFn<TIn, TOut5>,
    fn6: StepFn<TIn, TOut6>,
    fn7: StepFn<TIn, TOut7>,
    fn8: StepFn<TIn, TOut8>,
    fn9: StepFn<TIn, TOut9>,
    fn10: StepFn<TIn, TOut10>
  ): StepFn<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8, TOut9, TOut10]>;

  parallel<TIn>(...args: StepFn<TIn, any>[]): StepFn<TIn, any[]>;
}

const impl: StaticParallel = {
  /**
   * Execute the given async steps in parallel.
   *
   * @param {...any[]} args
   * @returns {*}
   * @example
   * const { compileDataSource, parallel } = require('batuajs/decorators');
   *
   * services.v1.test.op1.setup(p => p.push(
   *  parallel(
   *    compileDataSource((_, ctx, dataSource) => {
   *      return dataSource.request();
   *    })),
   *    compileDataSource((_, ctx, dataSource) => {
   *      return dataSource.request({id: 1});
   *    })
   *  )
   * ));
   */
  parallel(...args: any[]): any {
    return (...stepArgs: any[]) =>
      Promise.all(
        args.map(fn => {
          const result = fn(...stepArgs);
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
