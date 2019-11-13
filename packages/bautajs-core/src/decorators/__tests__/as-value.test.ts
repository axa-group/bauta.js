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
import { BautaJS, Document } from '../../index';
import { asValue } from '../as-value';

const testApiDefinitionsJson = require('./fixtures/test-api-definitions.json');

describe('as value decorator', () => {
  let bautajs: BautaJS;
  beforeEach(() => {
    bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
  });

  test('should allow send a simple value', async () => {
    bautajs.operations.v1.operation1.setup(p => {
      p.push(asValue([{ id: 1, name: 'pet' }]));
    });

    expect(
      await bautajs.operations.v1.operation1.run({ req: { query: {}, id: 1 }, res: {} })
    ).toStrictEqual([{ id: 1, name: 'pet' }]);
  });
});
