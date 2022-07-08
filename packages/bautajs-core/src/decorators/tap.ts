import { Pipeline } from '../types';
/**
 * Decorator that allows to transparently perform actions or side-effects,
 * such as logging and return the previous step result.
 *
 * @param {Pipeline.StepFunction<TIn, any>} stepFn - The step fn to execute
 * @returns {Pipeline.StepFunction<TIn, TIn>}
 *
 * @example
 *
 * const { tap, step, pipe } require('@axa/bautajs-core');
 *
 * const randomPreviousPipeline = step(() => 'I am so random!');
 *
 *  const pipeline = pipe(
 *    randomPreviousPipeline,
 *    tap((prev) => {
 *      console.log(`some intermediate step. Prev is ${prev}`);
 *      // => 'some intermediate step. Prev is I am so random!'
 *    }),
 *    (prev) => {
 *      console.log(prev);
 *      // print 'I am so random!'
 *    }
 *  );
 *
 */
export function tap<TIn>(stepFn: Pipeline.StepFunction<TIn, TIn>): Pipeline.StepFunction<TIn, TIn> {
  return (prev, ctx, bautajs) => {
    stepFn(prev, ctx, bautajs);

    return prev;
  };
}
