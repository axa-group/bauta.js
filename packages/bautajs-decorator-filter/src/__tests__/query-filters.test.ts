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
import { BautaJS, Document, pipe } from '@bautajs/core';
import { queryFilters } from '../index';

const testApiDefinitionsJson = require('./fixtures/test-api-definitions.json');

describe('query filter decorator', () => {
  let bautajs: BautaJS;
  beforeEach(async () => {
    bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
    await bautajs.bootstrap();
  });

  test('should filter the given array with the given loobpack filters', async () => {
    bautajs.operations.v1.operation1.validateResponse(false).setup(
      pipe(
        (_, ctx) => [
          { id: ctx.raw.req.id, name: 'pet' },
          { id: ctx.raw.req.id, name: 'pet2' }
        ],
        queryFilters(ctx => ctx.raw.req.query.filter)
      )
    );

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
