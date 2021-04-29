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
import { BautaJS, Document } from '../../index';
import { parallel } from '../parallel';

const testApiDefinitionsJson = require('./fixtures/test-api-definitions.json');

describe('parallel decorator', () => {
  let bautajs: BautaJS;
  beforeEach(async () => {
    bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
    await bautajs.bootstrap();
  });
  test('should execute the promises in parallel', async () => {
    bautajs.operations.v1.operation1.setup(
      parallel(
        () => Promise.resolve({ id: 3, name: 'pet3' }),
        () => Promise.resolve({ id: 1, name: 'pet' })
      )
    );

    expect(
      await bautajs.operations.v1.operation1.run({ req: { query: {}, id: 1 }, res: {} })
    ).toStrictEqual([
      { id: 3, name: 'pet3' },
      { id: 1, name: 'pet' }
    ]);
  });
});
