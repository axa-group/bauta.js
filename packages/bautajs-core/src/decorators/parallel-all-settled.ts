import { Pipeline } from '../types.js';

export function parallelAllSettled<TIn, TOut1, TOut2>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>
): Pipeline.StepFunction<TIn, [PromiseSettledResult<TOut1>, PromiseSettledResult<TOut2>]>;

export function parallelAllSettled<TIn, TOut1, TOut2, TOut3>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>,
  fn3: Pipeline.StepFunction<TIn, TOut3>
): Pipeline.StepFunction<
  TIn,
  [PromiseSettledResult<TOut1>, PromiseSettledResult<TOut2>, PromiseSettledResult<TOut3>]
>;

export function parallelAllSettled<TIn, TOut1, TOut2, TOut3, TOut4>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>,
  fn3: Pipeline.StepFunction<TIn, TOut3>,
  fn4: Pipeline.StepFunction<TIn, TOut4>
): Pipeline.StepFunction<
  TIn,
  [
    PromiseSettledResult<TOut1>,
    PromiseSettledResult<TOut2>,
    PromiseSettledResult<TOut3>,
    PromiseSettledResult<TOut4>
  ]
>;

export function parallelAllSettled<TIn, TOut1, TOut2, TOut3, TOut4, TOut5>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>,
  fn3: Pipeline.StepFunction<TIn, TOut3>,
  fn4: Pipeline.StepFunction<TIn, TOut4>,
  fn5: Pipeline.StepFunction<TIn, TOut5>
): Pipeline.StepFunction<
  TIn,
  [
    PromiseSettledResult<TOut1>,
    PromiseSettledResult<TOut2>,
    PromiseSettledResult<TOut3>,
    PromiseSettledResult<TOut4>,
    PromiseSettledResult<TOut5>
  ]
>;

export function parallelAllSettled<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>,
  fn3: Pipeline.StepFunction<TIn, TOut3>,
  fn4: Pipeline.StepFunction<TIn, TOut4>,
  fn5: Pipeline.StepFunction<TIn, TOut5>,
  fn6: Pipeline.StepFunction<TIn, TOut6>
): Pipeline.StepFunction<
  TIn,
  [
    PromiseSettledResult<TOut1>,
    PromiseSettledResult<TOut2>,
    PromiseSettledResult<TOut3>,
    PromiseSettledResult<TOut4>,
    PromiseSettledResult<TOut5>,
    PromiseSettledResult<TOut6>
  ]
>;

export function parallelAllSettled<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>,
  fn3: Pipeline.StepFunction<TIn, TOut3>,
  fn4: Pipeline.StepFunction<TIn, TOut4>,
  fn5: Pipeline.StepFunction<TIn, TOut5>,
  fn6: Pipeline.StepFunction<TIn, TOut6>,
  fn7: Pipeline.StepFunction<TIn, TOut7>
): Pipeline.StepFunction<
  TIn,
  [
    PromiseSettledResult<TOut1>,
    PromiseSettledResult<TOut2>,
    PromiseSettledResult<TOut3>,
    PromiseSettledResult<TOut4>,
    PromiseSettledResult<TOut5>,
    PromiseSettledResult<TOut6>,
    PromiseSettledResult<TOut7>
  ]
>;

export function parallelAllSettled<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>,
  fn3: Pipeline.StepFunction<TIn, TOut3>,
  fn4: Pipeline.StepFunction<TIn, TOut4>,
  fn5: Pipeline.StepFunction<TIn, TOut5>,
  fn6: Pipeline.StepFunction<TIn, TOut6>,
  fn7: Pipeline.StepFunction<TIn, TOut7>,
  fn8: Pipeline.StepFunction<TIn, TOut8>
): Pipeline.StepFunction<
  TIn,
  [
    PromiseSettledResult<TOut1>,
    PromiseSettledResult<TOut2>,
    PromiseSettledResult<TOut3>,
    PromiseSettledResult<TOut4>,
    PromiseSettledResult<TOut5>,
    PromiseSettledResult<TOut6>,
    PromiseSettledResult<TOut7>,
    PromiseSettledResult<TOut8>
  ]
>;

export function parallelAllSettled<
  TIn,
  TOut1,
  TOut2,
  TOut3,
  TOut4,
  TOut5,
  TOut6,
  TOut7,
  TOut8,
  TOut9
>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>,
  fn3: Pipeline.StepFunction<TIn, TOut3>,
  fn4: Pipeline.StepFunction<TIn, TOut4>,
  fn5: Pipeline.StepFunction<TIn, TOut5>,
  fn6: Pipeline.StepFunction<TIn, TOut6>,
  fn7: Pipeline.StepFunction<TIn, TOut7>,
  fn8: Pipeline.StepFunction<TIn, TOut8>,
  fn9: Pipeline.StepFunction<TIn, TOut9>
): Pipeline.StepFunction<
  TIn,
  [
    PromiseSettledResult<TOut1>,
    PromiseSettledResult<TOut2>,
    PromiseSettledResult<TOut3>,
    PromiseSettledResult<TOut4>,
    PromiseSettledResult<TOut5>,
    PromiseSettledResult<TOut6>,
    PromiseSettledResult<TOut7>,
    PromiseSettledResult<TOut8>,
    PromiseSettledResult<TOut9>
  ]
>;

export function parallelAllSettled<
  TIn,
  TOut1,
  TOut2,
  TOut3,
  TOut4,
  TOut5,
  TOut6,
  TOut7,
  TOut8,
  TOut9,
  TOut10
>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>,
  fn3: Pipeline.StepFunction<TIn, TOut3>,
  fn4: Pipeline.StepFunction<TIn, TOut4>,
  fn5: Pipeline.StepFunction<TIn, TOut5>,
  fn6: Pipeline.StepFunction<TIn, TOut6>,
  fn7: Pipeline.StepFunction<TIn, TOut7>,
  fn8: Pipeline.StepFunction<TIn, TOut8>,
  fn9: Pipeline.StepFunction<TIn, TOut9>,
  fn10: Pipeline.StepFunction<TIn, TOut10>
): Pipeline.StepFunction<
  TIn,
  [
    PromiseSettledResult<TOut1>,
    PromiseSettledResult<TOut2>,
    PromiseSettledResult<TOut3>,
    PromiseSettledResult<TOut4>,
    PromiseSettledResult<TOut5>,
    PromiseSettledResult<TOut6>,
    PromiseSettledResult<TOut7>,
    PromiseSettledResult<TOut8>,
    PromiseSettledResult<TOut9>,
    PromiseSettledResult<TOut10>
  ]
>;
export function parallelAllSettled<TIn>(
  ...functions: Pipeline.StepFunction<TIn, any>[]
): Pipeline.StepFunction<TIn, PromiseSettledResult<any[]>>;
/**
 * Execute the given async Pipeline.StepFunctions in parallel.
 * @template TIn
 * @template TOut
 * @param {...functions: Pipeline.StepFunction<TIn, any>[]} functions
 * @returns {Pipeline.StepFunction<TIn, any[]>}
 * @example
 *
 * const { parallelAllSettled, pipe } = require('@batuajs/core');
 * const { getCats, getDogs, playWithAnimals } = require('./my-datasource');
 *
 * operations.op1.setup(pipe(
      parallelAllSettled(
        getCats(),
        getCats(),
        getDogs()
      ),
      ([getCatsResultOne, getCatsResultTwo, getDogsResult]) => {
        if (getDogsResult.status === 'rejected') {
          playWithAnimals(getCatsResultOne.value, getCatsResultTwo.value)
        }
        playWithAnimals(getDogsResult.value)
      })
    );
 */
export function parallelAllSettled(...functions: any): Pipeline.StepFunction<any, any> {
  return async function parallelPiped(prev: any, ctx, bautajs): Promise<any> {
    return Promise.allSettled<any>(functions.map((fn: any) => fn(prev, ctx, bautajs)));
  };
}
