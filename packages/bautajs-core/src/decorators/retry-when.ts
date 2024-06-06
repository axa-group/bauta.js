import { Pipeline } from '../types.js';

const sleep = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms).unref());

interface RetryWhenOptions {
  /**
   * Maximum number of retries.
   *
   * @type {number}
   * @memberof RetryWhenOptions
   */
  readonly maxRetryAttempts?: number;

  /**
   * Timeout to wait between each retry.
   *
   * @type {number}
   * @memberof RetryWhenOptions
   */
  readonly scalingDuration?: number;

  /**
   * Custom error to throw if required.
   *
   * @type {Error}
   * @memberof RetryWhenOptions
   */
  readonly error?: Error;
}

class RetryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetryError';
  }
}

/**
 *
 * This decorator tries to execute fnStep until condition is meet or maxRetryAttempts are tried.
 *
 *
 * @param {Pipeline.StepFunction<TIn,TOut>} fnStep step executed
 * @param {(result:any) => boolean} condition condition that when true stops the retry and returns the result of the pipeline
 * @param {RetryWhenOptions} options indicate custom values that overwrite the defaults for maxRetryAttempts (3), scalingDuration (10 ms) and error.
 * @returns {Pipeline.StepFunction<TIn,TOut>}
 */
export function retryWhen<TIn, TOut>(
  fnStep: Pipeline.StepFunction<TIn, TOut>,
  condition: (result?: any, i?: number) => boolean,
  options: RetryWhenOptions = {}
): Pipeline.StepFunction<TIn, TOut> {
  const maxRetryAttempts = options.maxRetryAttempts || 3;
  const scalingDuration = options.scalingDuration || 10; // milliseconds
  const error =
    options.error || new RetryError(`Condition was not meet in ${maxRetryAttempts} retries.`);

  return async (prev, ctx, bautajs) => {
    let i = 0;
    for (; i < maxRetryAttempts && !ctx.token.isCanceled; i += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const result = await fnStep(prev, ctx, bautajs);

        if (condition(result, i)) {
          return result;
        }
      } catch (err: any) {
        ctx.log.error(`Error executing retryUntil, retry number: ${i}; ${err.message}.`);
      }
      // eslint-disable-next-line no-await-in-loop
      await sleep(scalingDuration);
    }
    if (ctx.token.isCanceled) {
      throw new RetryError(`Request cancelled by the user during attempt number ${i}.`);
    }
    throw error;
  };
}
