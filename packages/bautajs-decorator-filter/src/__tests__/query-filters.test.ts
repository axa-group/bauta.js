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
import { BautaJSInstance, createContext, pipe } from '@bautajs/core';
import { queryFilters } from '../index';

describe('query filter decorator', () => {
  test('should filter the given array with the given loopback filters', async () => {
    const pipeline = pipe(
      (_, ctx) => [
        { id: ctx.data.id, name: 'pet' },
        { id: ctx.data.id, name: 'pet2' }
      ],
      queryFilters(ctx => ctx.data.filter)
    );

    expect(
      pipeline(
        null,
        createContext({
          data: {
            id: 1,
            filter: {
              where: {
                name: 'pet2'
              }
            }
          }
        }),
        {} as BautaJSInstance
      )
    ).toStrictEqual([{ id: 1, name: 'pet2' }]);
  });
});
