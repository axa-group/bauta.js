import { Pipeline } from '../types';
import { isPromise } from '../utils/is-promise';

/**
 * Decorator that allows to transparently perform actions or side-effects,
 * such as logging and return the previous step result.
 *
 * Tap supports promises, but it will ignore any error thrown inside the tapped
 * promise and will wait for its execution just to ignore its value.
 *
 * The step inside tap does not need to return anything, since if it returns anything,
 * it will be ignored anyways in favour of what was in the previous step.
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
 *      console.log(`some intermediate step. Prev is "${prev}""`);
 *      // prints 'some intermediate step. Prev is "I am so random!"'
 *    }),
 *    tap(async (prev) => {
 *      await asyncProcess();
 *      //'whether asyncProcess resolves or rejects. Prev still will be "I am so random!"'
 *    }),
 *    (prev) => {
 *      console.log(prev);
 *      // prints 'I am so random!'
 *    }
 *  );
 *
 */
export function tap<TIn>(
  stepFn: Pipeline.StepFunction<TIn, TIn | void>
): Pipeline.StepFunction<TIn, TIn | void> {
  return (prev, ctx, bautajs) => {
    const result = stepFn(prev, ctx, bautajs);

    if (isPromise(result)) {
      return (result as Promise<typeof result>).then(() => prev).catch(() => prev);
    }
    return prev;
  };
}
