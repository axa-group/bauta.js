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
const { restDataSource } = require('@bautajs/datasource-rest');

module.exports = restDataSource({
  options: {
    cache: new Map()
  },
  providers: [
    {
      id: 'provider1',
      options(_, ctx, $static) {
        return {
          reqId: ctx.req.query.a,
          method: 'GET',
          url: `https://jsonplaceholder.typicode.com/posts?limit=${ctx.req.query.limit}`,
          headers: {
            'custom-header': $static.someVar
          }
        };
      }
    }
  ]
});
