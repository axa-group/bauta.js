import { Pipeline } from '../types';
import { isPromise } from '../utils/is-promise';

/**
 * Decorator that allows to transparently perform actions or side-effects,
 * such as logging and return the previous step result.
 *
 * Tap supports promises, but it will ignore any error thrown inside the tapped
 * promise and will wait for its execution just to ignore its value.
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
    const result = stepFn(prev, ctx, bautajs);

    if (isPromise(result)) {
      return (result as Promise<typeof result>).then(() => prev).catch(() => prev);
    }
    return prev;
  };
}
