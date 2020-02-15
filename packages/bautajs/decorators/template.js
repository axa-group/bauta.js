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
const STJS = require('stjs');

/**
 * Compile the json {@link https://www.npmjs.com/package/stjs|stjs} template with the given ctx, env, and previous value.
 * The injected variables into the template are:
 * - ctx: the current context (req, res...)
 * - previousValue: the previous result
 * - env: the environment variable
 * @function template
 * @async
 * @param {Object} [template] - The {@link https://www.npmjs.com/package/stjs|stjs} template
 * @example
 * const template = require('batuajs/decorators/template');
 *
 * const myTemplate = {
 *    "acceptHeader": "{{ctx.req.headers.accept}}",
 *    "id": "{{previousValue.id}}",
 *    "myEnv": "{{env.myEnv}}"
 * }
 *
 * services.v1.test.op1.push(template(myTemplate));
 */
module.exports = template => (value, ctx) =>
  STJS.select({
    ctx,
    previousValue: value,
    env: process.env
  })
    .transformWith(template)
    .root();
