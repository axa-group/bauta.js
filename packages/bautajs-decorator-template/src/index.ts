/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Licensed under the AXA Group Operations Spain S.A. License (the "License");
 * you may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import stjs from 'stjs';
import { Context, Pipeline } from '@bautajs/core';

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
 * @returns {Pipeline.StepFunction<TIn, TOut>}
 * @example
 * const { template } = require('@batuajs/decorators');
 *
 * const myTemplate = {
 *    "acceptHeader": "{{ctx.data.headers.accept}}",
 *    "id": "{{previousValue.id}}",
 *    "myEnv": "{{env.myEnv}}"
 * }
 *
 * operations.v1.op1.setup(template(myTemplate));
 */
export function template<TIn, TOut>(currentTemplate: TOut): Pipeline.StepFunction<TIn, TOut> {
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
