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
const flow = require('bautajs/decorators/flow');
const memoizee = require('memoizee');

/**
 * Cache the especified chain of functions
 * @function cache
 * @async
 * @param {function} functions - the functions which results will be cached
 * @param {object} options - {@link https://www.npmjs.com/package/memoizee#configuration|memoizee options}
 * @example
 * const request = require('bautajs/decorators/request');
 * const cache = require('bautajs-cache-decorator');
 *
 * services.v1.test.op1.push(cache([request, (res) => res+99], { maxAge: 1000, preFetch: true })
 */
module.exports = (functions, normalizer, options = {}) => {
  if (!normalizer) {
    throw new Error(
      'normalizer: (args)=>{} function is a mandatory parameter to calculate the cache key'
    );
  }
  const cached = memoizee(flow(functions), { ...options, normalizer, promise: true });

  return async (value, ctx) => cached(value, ctx);
};
