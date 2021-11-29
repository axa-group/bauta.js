import { Pipeline } from '../types';

export function parallel<TIn, TOut1, TOut2>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>
): Pipeline.StepFunction<TIn, [TOut1, TOut2]>;

export function parallel<TIn, TOut1, TOut2, TOut3>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>,
  fn3: Pipeline.StepFunction<TIn, TOut3>
): Pipeline.StepFunction<TIn, [TOut1, TOut2, TOut3]>;

export function parallel<TIn, TOut1, TOut2, TOut3, TOut4>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>,
  fn3: Pipeline.StepFunction<TIn, TOut3>,
  fn4: Pipeline.StepFunction<TIn, TOut4>
): Pipeline.StepFunction<TIn, [TOut1, TOut2, TOut3, TOut4]>;

export function parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>,
  fn3: Pipeline.StepFunction<TIn, TOut3>,
  fn4: Pipeline.StepFunction<TIn, TOut4>,
  fn5: Pipeline.StepFunction<TIn, TOut5>
): Pipeline.StepFunction<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5]>;

export function parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>,
  fn3: Pipeline.StepFunction<TIn, TOut3>,
  fn4: Pipeline.StepFunction<TIn, TOut4>,
  fn5: Pipeline.StepFunction<TIn, TOut5>,
  fn6: Pipeline.StepFunction<TIn, TOut6>
): Pipeline.StepFunction<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6]>;

export function parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>,
  fn3: Pipeline.StepFunction<TIn, TOut3>,
  fn4: Pipeline.StepFunction<TIn, TOut4>,
  fn5: Pipeline.StepFunction<TIn, TOut5>,
  fn6: Pipeline.StepFunction<TIn, TOut6>,
  fn7: Pipeline.StepFunction<TIn, TOut7>
): Pipeline.StepFunction<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7]>;

export function parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>,
  fn3: Pipeline.StepFunction<TIn, TOut3>,
  fn4: Pipeline.StepFunction<TIn, TOut4>,
  fn5: Pipeline.StepFunction<TIn, TOut5>,
  fn6: Pipeline.StepFunction<TIn, TOut6>,
  fn7: Pipeline.StepFunction<TIn, TOut7>,
  fn8: Pipeline.StepFunction<TIn, TOut8>
): Pipeline.StepFunction<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8]>;

export function parallel<TIn, TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8, TOut9>(
  fn1: Pipeline.StepFunction<TIn, TOut1>,
  fn2: Pipeline.StepFunction<TIn, TOut2>,
  fn3: Pipeline.StepFunction<TIn, TOut3>,
  fn4: Pipeline.StepFunction<TIn, TOut4>,
  fn5: Pipeline.StepFunction<TIn, TOut5>,
  fn6: Pipeline.StepFunction<TIn, TOut6>,
  fn7: Pipeline.StepFunction<TIn, TOut7>,
  fn8: Pipeline.StepFunction<TIn, TOut8>,
  fn9: Pipeline.StepFunction<TIn, TOut9>
): Pipeline.StepFunction<TIn, [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8, TOut9]>;

export function parallel<
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
  [TOut1, TOut2, TOut3, TOut4, TOut5, TOut6, TOut7, TOut8, TOut9, TOut10]
>;
export function parallel<TIn>(
  ...functions: Pipeline.StepFunction<TIn, any>[]
): Pipeline.StepFunction<TIn, any[]>;
/**
 * Execute the given async Pipeline.StepFunctions in parallel.
 * @template TIn
 * @template TOut
 * @param {...functions: Pipeline.StepFunction<TIn, any>[]} functions
 * @returns {Pipeline.StepFunction<TIn, any[]>}
 * @example
 * const { parallel } = require('@batuajs/core');
 * const { getCats } = require('./my-datasource');
 *
 * operations.v1.op1.setup(parallel(
 *    getCats(),
 *    getCats()
 * ));
 */
export function parallel<T, R>(
  ...functions: Array<Pipeline.StepFunction<T, R>>
): Pipeline.StepFunction<T, R[]> {
  return async function parallelPiped(prev: T, ctx, bautajs): Promise<R[]> {
    return Promise.all<R>(functions.map(fn => fn(prev, ctx, bautajs)));
  };
}
