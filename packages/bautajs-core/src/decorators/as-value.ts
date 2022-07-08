import { Pipeline } from '../types';

/**
 *
 * Allow to pass directly a value to the resolver
 * @export
 * @template TIn
 * @template TOut
 * @param {TOut} someValue
 * @returns {Pipeline.StepFunction<TIn, TOut>}
 * @example
 * const { asValue, pipe } = require('@batuajs/core');
 *
 * operations.v1.op1.setup(asValue(5))
 */
export function asValue<TIn, TOut>(someValue: TOut): Pipeline.StepFunction<TIn, TOut> {
  return (): TOut => someValue;
}

export default asValue;
