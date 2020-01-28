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
import { template } from '../index';

const testApiDefinitionsJson = require('./fixtures/test-api-definitions.json');

describe('template decorator', () => {
  test('should allow put a template', async () => {
    const bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
    await bautajs.bootstrap();
    bautajs.operations.v1.operation1.setup(p => {
      p.push(() => '1').push(template([{ id: '{{ctx.req.id}}', name: '{{previousValue}}' }]));
    });

    expect(
      await bautajs.operations.v1.operation1.run({ req: { id: 1, query: {} }, res: {} })
    ).toStrictEqual([{ id: 1, name: '1' }]);
  });

  test('should bypass not valid template', async () => {
    const bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
    await bautajs.bootstrap();

    bautajs.operations.v1.operation1.validateResponse(false).setup(p => {
      p.push(() => '1').push(template(undefined));
    });

    expect(
      await bautajs.operations.v1.operation1.run({ req: { id: 1, query: {} }, res: {} })
    ).toBeUndefined();
  });
});
