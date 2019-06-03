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

export interface StaticParallel {
  parallel<TReq, TRes, TIn, TOut1, TOut2>(
    fn1: StepFn<TReq, TRes, TIn, TOut1>,
    fn2: StepFn<TReq, TRes, TIn, TOut2>
  ): StepFn<TReq, TRes, TIn, [TOut1, TOut2]>;

  parallel<TReq, TRes, TIn, TOut1, TOut2, TOut3>(
    fn1: StepFn<TReq, TRes, TIn, TOut1>,
    fn2: StepFn<TReq, TRes, TIn, TOut2>,
    fn3: StepFn<TReq, TRes, TIn, TOut3>
  ): StepFn<TReq, TRes, TIn, [TOut1, TOut2, TOut3]>;

  parallel<TReq, TRes, TIn, TOut1, TOut2, TOut3, TOut4>(
    fn1: StepFn<TReq, TRes, TIn, TOut1>,
    fn2: StepFn<TReq, TRes, TIn, TOut2>,
    fn3: StepFn<TReq, TRes, TIn, TOut3>,
    fn4: StepFn<TReq, TRes, TIn, TOut4>
  ): StepFn<TReq, TRes, TIn, [TOut1, TOut2, TOut3, TOut4]>;

  parallel<TReq, TRes, TIn, TOut1, TOut2, TOut3, TOut4, TOut5>(
    fn1: StepFn<TReq, TRes, TIn, TOut1>,
    fn2: StepFn<TReq, TRes, TIn, TOut2>,
    fn3: StepFn<TReq, TRes, TIn, TOut3>,
    fn4: StepFn<TReq, TRes, TIn, TOut4>,
    fn5: StepFn<TReq, TRes, TIn, TOut5>
  ): StepFn<TReq, TRes, TIn, [TOut1, TOut2, TOut3, TOut4, TOut5]>;

  parallel<TReq, TRes, TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6>(
    fn1: StepFn<TReq, TRes, TIn, TOut1>,
    fn2: StepFn<TReq, TRes, TIn, TOut2>,
    fn3: StepFn<TReq, TRes, TIn, TOut3>,
    fn4: StepFn<TReq, TRes, TIn, TOut4>,
    fn5: StepFn<TReq, TRes, TIn, TOut5>,
    fn6: StepFn<TReq, TRes, TIn, TOut6>
  ): StepFn<TReq, TRes, TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6]>;

  parallel<TReq, TRes, TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7>(
    fn1: StepFn<TReq, TRes, TIn, TOut1>,
    fn2: StepFn<TReq, TRes, TIn, TOut2>,
    fn3: StepFn<TReq, TRes, TIn, TOut3>,
    fn4: StepFn<TReq, TRes, TIn, TOut4>,
    fn5: StepFn<TReq, TRes, TIn, TOut5>,
    fn6: StepFn<TReq, TRes, TIn, TOut6>,
    fn7: StepFn<TReq, TRes, TIn, TOut7>
  ): StepFn<TReq, TRes, TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7]>;

  parallel<TReq, TRes, TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8>(
    fn1: StepFn<TReq, TRes, TIn, TOut1>,
    fn2: StepFn<TReq, TRes, TIn, TOut2>,
    fn3: StepFn<TReq, TRes, TIn, TOut3>,
    fn4: StepFn<TReq, TRes, TIn, TOut4>,
    fn5: StepFn<TReq, TRes, TIn, TOut5>,
    fn6: StepFn<TReq, TRes, TIn, TOut6>,
    fn7: StepFn<TReq, TRes, TIn, TOut7>,
    fn8: StepFn<TReq, TRes, TIn, TOut8>
  ): StepFn<TReq, TRes, TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8]>;

  parallel<TReq, TRes, TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8, TOut9>(
    fn1: StepFn<TReq, TRes, TIn, TOut1>,
    fn2: StepFn<TReq, TRes, TIn, TOut2>,
    fn3: StepFn<TReq, TRes, TIn, TOut3>,
    fn4: StepFn<TReq, TRes, TIn, TOut4>,
    fn5: StepFn<TReq, TRes, TIn, TOut5>,
    fn6: StepFn<TReq, TRes, TIn, TOut6>,
    fn7: StepFn<TReq, TRes, TIn, TOut7>,
    fn8: StepFn<TReq, TRes, TIn, TOut8>,
    fn9: StepFn<TReq, TRes, TIn, TOut9>
  ): StepFn<TReq, TRes, TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8, TOut9]>;

  parallel<TReq, TRes, TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8, TOut9, TOut10>(
    fn1: StepFn<TReq, TRes, TIn, TOut1>,
    fn2: StepFn<TReq, TRes, TIn, TOut2>,
    fn3: StepFn<TReq, TRes, TIn, TOut3>,
    fn4: StepFn<TReq, TRes, TIn, TOut4>,
    fn5: StepFn<TReq, TRes, TIn, TOut5>,
    fn6: StepFn<TReq, TRes, TIn, TOut6>,
    fn7: StepFn<TReq, TRes, TIn, TOut7>,
    fn8: StepFn<TReq, TRes, TIn, TOut8>,
    fn9: StepFn<TReq, TRes, TIn, TOut9>,
    fn10: StepFn<TReq, TRes, TIn, TOut10>
  ): StepFn<
    TReq,
    TRes,
    TIn,
    [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8, TOut9, TOut10]
  >;

  parallel<TReq, TRes, TIn>(
    ...args: StepFn<TReq, TRes, TIn, any>[]
  ): StepFn<TReq, TRes, TIn, any[]>;
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
   *    compileDataSource((_, ctx) => {
   *      return ctx.dataSource.request();
   *    })),
   *    compileDataSource((_, ctx) => {
   *      return ctx.dataSource.request({id: 1});
   *    })
   *  )
   * ));
   */
  parallel(...args: any[]): any {
    return (prev: any, ctx: any) =>
      Promise.all(
        args.map(fn => {
          const result = fn(prev, ctx);
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
