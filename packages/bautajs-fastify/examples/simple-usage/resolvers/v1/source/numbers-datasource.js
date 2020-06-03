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
const { restProvider } = require('@bautajs/datasource-rest');

const exampleRestProviderYear = restProvider((client, _prv, ctx) => {
  return client.get('http://numbersapi.com/random/year?json', {
    headers: ctx.req.headers
  });
});

const exampleRestProvider = restProvider((client, _prv, ctx) => {
  return client.get(`http://numbersapi.com/${ctx.req.params.number}/math`, {
    responseType: 'text',
    resolveBodyOnly: true,
    headers: ctx.req.headers
  });
});

module.exports = {
  exampleRestProviderYear,
  exampleRestProvider
};