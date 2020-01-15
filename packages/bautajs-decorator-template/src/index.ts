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
import stjs from 'stjs';
import { Context, OperatorFunction } from '@bautajs/core';

/**
 * Compile the json {@link https://www.npmjs.com/package/stjs|stjs} template with the given ctx, env, and previous value.
 * The injected variables into the template are:
 * - ctx: the current context (req, res...)
 * - previousValue: the previous result
 * - env: the environment variable
 * @export
 * @template TIn
 * @template TOut
 * @param {TOut} currentTemplate
 * @returns {OperatorFunction<TIn, TOut>}
 * @example
 * const { template } = require('@batuajs/decorators');
 *
 * const myTemplate = {
 *    "acceptHeader": "{{ctx.req.headers.accept}}",
 *    "id": "{{previousValue.id}}",
 *    "myEnv": "{{env.myEnv}}"
 * }
 *
 * operations.v1.op1.push(template(myTemplate));
 */
export function template<TIn, TOut>(currentTemplate: TOut): OperatorFunction<TIn, TOut> {
  return (value: TIn, ctx: Context): TOut =>
    stjs
      .select({
        ctx,
        previousValue: value,
        env: process.env
      })
      .transformWith(currentTemplate)
      .root();
}

export default template;
