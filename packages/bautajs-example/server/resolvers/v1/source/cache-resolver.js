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
const { resolver, pipeline: pipelineResolver, pipelineBuilder } = require('@bautajs/core');
const { cache } = require('@bautajs/decorator-cache');
const { chuckProvider } = require('./chuck-datasource');

const transformResponse = response => {
  const result = {
    message: response
  };

  return result;
};

const normalizer = ([, ctx]) => ctx.req.params.string;

const chuckFactsPipeline = pipelineBuilder(pipeline =>
  pipeline.pipe(chuckProvider(), transformResponse)
);

const cachedChuckFactsPipeline = pipelineResolver(pipeline =>
  pipeline.push(cache(chuckFactsPipeline, normalizer))
);

module.exports = resolver(operations => {
  operations.v1.chuckFacts.setup(cachedChuckFactsPipeline);
});