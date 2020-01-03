/*
 * Copyright (c) AXA Shared Services Spain S.A.
 *
 * Licensed under the AXA Shared Services Spain S.A. License (the "License"); you
 * may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { BautaJS, Document } from '@bautajs/core';
import { queryFilters } from '../index';

const testApiDefinitionsJson = require('./fixtures/test-api-definitions.json');

describe('query filter decorator', () => {
  let bautajs: BautaJS;
  beforeEach(() => {
    bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
  });

  test('should filter the given array with the given loobpack filters', async () => {
    bautajs.operations.v1.operation1.validateResponse(false).setup(p => {
      p.push((_, ctx) => [
        { id: ctx.req.id, name: 'pet' },
        { id: ctx.req.id, name: 'pet2' }
      ]).push(queryFilters());
    });

    expect(
      await bautajs.operations.v1.operation1.run({
        req: {
          id: 1,
          query: {
            filter: {
              where: {
                name: 'pet2'
              }
            }
          }
        },
        res: {}
      })
    ).toStrictEqual([{ id: 1, name: 'pet2' }]);
  });
});
