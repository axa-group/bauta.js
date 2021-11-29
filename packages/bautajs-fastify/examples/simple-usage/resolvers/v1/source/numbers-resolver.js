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
const { resolver, step, pipe } = require('@axa-group/bautajs-core');
const { exampleRestProviderYear, exampleRestProvider } = require('./numbers-datasource');
const { catsRestProviderWithHttps } = require('./cats-datasource');

const transformResponse = step(response => {
  return {
    message: response
  };
});

module.exports = resolver(operations => {
  operations.randomYear.setup(pipe(exampleRestProviderYear(), transformResponse));
  operations.randomYear2.setup(pipe(exampleRestProviderYear(), transformResponse));

  operations.factNumber.setup(pipe(exampleRestProvider(), transformResponse));

  operations.factNumber2.setup(pipe(exampleRestProvider(), transformResponse));

  operations.cats.setup(pipe(catsRestProviderWithHttps(), transformResponse));
});
