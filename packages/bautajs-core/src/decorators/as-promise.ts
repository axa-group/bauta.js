import { promisify } from 'util';
import { BautaJSInstance, Context, GenericError, Pipeline } from '../types';

export type StepFunctionCallback<TIn, TOut> = (
  prev: TIn,
  ctx: Context,
  bautajs: BautaJSInstance,
  callback: (err: GenericError, val: TOut) => void
) => void;

/**
 * Allow you to use a callback style async operation
 * @export
 * @template TIn
 * @template TOut
 * @param {StepFunctionCallback<TIn, TOut>} fn
 * @returns {Pipeline.StepFunction<TIn, TOut>}
 * @example
 * const { asPromise } = require('@batuajs/core');
 *
 * operations.v1.op1.setup(asPromise((_, ctx, batuajs, done) => {
 *  done(null, 'hey')
 * }))
 */
export function asPromise<TIn, TOut>(
  fn: StepFunctionCallback<TIn, TOut>
): Pipeline.StepFunction<TIn, Promise<TOut>> {
  return promisify<TIn, Context, BautaJSInstance, TOut>(fn);
}

export default asPromise;
