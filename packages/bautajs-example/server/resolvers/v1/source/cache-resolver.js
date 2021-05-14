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
const { getRequest } = require('@bautajs/express');
const { pipe, resolver, step } = require('@bautajs/core');
const { cache } = require('@bautajs/decorator-cache');
const { chuckProvider } = require('./chuck-datasource');

const transformResponse = step(response => {
  const result = {
    message: response
  };

  return result;
});

const normalizer = (_, ctx) => {
  const req = getRequest(ctx);
  return req.params.string;
};

const chuckFactsPipeline = pipe(chuckProvider(), transformResponse);

const cachedChuckFactsPipeline = pipe(cache(chuckFactsPipeline, normalizer, { maxSize: 2 }));

module.exports = resolver(operations => {
  operations.chuckFacts.setup(cachedChuckFactsPipeline);
});
