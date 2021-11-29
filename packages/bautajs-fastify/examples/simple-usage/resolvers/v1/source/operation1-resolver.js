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
const { resolver, pipe, match } = require('@axa-group/bautajs-core');
const { provider1 } = require('./source-datasource');

const myPipelinetwo = pipe((response, ctx) => {
  ctx.log.info('pipeline 2');

  return response;
});

const myPipeline = pipe((response, ctx) => {
  ctx.log.info('pipeline 1');
  return response;
});

module.exports = resolver(operations => {
  operations.operation1.setup(
    pipe(
      provider1(),
      match(m =>
        m
          .on(prev => {
            return prev === null;
          }, myPipeline)
          .otherwise(myPipelinetwo)
      )
    )
  );
});
