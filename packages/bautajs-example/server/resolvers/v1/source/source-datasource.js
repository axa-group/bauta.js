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
const { getRequest } = require('@axa/bautajs-express');
const { restProvider } = require('@axa/bautajs-datasource-rest');

module.exports.provider1 = restProvider((client, _, ctx, bautajs) => {
  const req = getRequest(ctx);
  return client.get(`https://jsonplaceholder.typicode.com/posts?limit=${req.query.limit}`, {
    cache: new Map(),
    reqId: req.query.a,
    method: 'GET',
    headers: {
      'custom-header': bautajs.staticConfig.someVar
    }
  });
});
