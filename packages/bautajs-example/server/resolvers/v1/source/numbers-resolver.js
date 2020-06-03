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
const { resolver } = require('@bautajs/core');
const { exampleRestProviderYear, exampleRestProvider } = require('./numbers-datasource');
const { catsRestProviderWithHttps } = require('./cats-datasource');

const transformResponse = response => {
  const result = {
    message: response
  };

  return result;
};

module.exports = resolver(operations => {
  operations.v1.randomYear
    .validateRequest(false)
    .validateResponse(false)
    .setup(p => p.pipe(exampleRestProviderYear(), transformResponse));
  operations.v1.randomYear2
    .validateRequest(false)
    .validateResponse(false)
    .setup(p => p.pipe(exampleRestProviderYear(), transformResponse));

  operations.v1.factNumber
    .validateRequest(false)
    .validateResponse(false)
    .setup(p => p.pipe(exampleRestProvider(), transformResponse));

  operations.v1.factNumber2
    .validateRequest(false)
    .validateResponse(false)
    .setup(p => p.pipe(exampleRestProvider(), transformResponse));

  operations.v1.cats
    .validateRequest(false)
    .validateResponse(false)
    .setup(p => p.pipe(catsRestProviderWithHttps(), transformResponse));
});