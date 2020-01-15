/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { promisify } from 'util';
import { BautaJSInstance, Context } from '@bautajs/core';
import { CompiledRestProvider, OperatorFunctionCompiled } from '../utils/types';

export type OperatorFunctionCallback<TIn, TOut> = (
  prev: TIn,
  ctx: Context,
  bautajs: BautaJSInstance,
  provider: CompiledRestProvider,
  callback: (err: Error | null, val: TOut) => void
) => void;

/**
 * Allow you to use a callback style async operation on compiled datasource context
 * @export
 * @template TIn
 * @template TOut
 * @param {OperatorFunctionCallback<TIn, TOut>} fn
 * @returns {OperatorFunction<TIn, TOut>}
 * @example
 * const { asPromise } = require('@batuajs/datasource-rest');
 *+
 * operations.v1.op1.setup(p => p.push(asPromise((_, ctx, provider, batuajs, done) => {
 *  done(null, 'hey')
 * })))
 */
export function asPromise<TIn, TOut>(
  fn: OperatorFunctionCallback<TIn, TOut>
): OperatorFunctionCompiled<TIn, TOut> {
  return promisify<TIn, Context, BautaJSInstance, CompiledRestProvider, TOut>(fn);
}

export default asPromise;
