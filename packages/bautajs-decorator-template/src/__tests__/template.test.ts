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
/* global expect, describe, test, beforeEach */
import path from 'path';
import { BautaJS, Document } from '@bautajs/core';
import { template } from '../index';

const testApiDefinitionsJson = require('./fixtures/test-api-definitions.json');

describe('Template decorator', () => {
  let bautajs: BautaJS;
  beforeEach(() => {
    bautajs = new BautaJS(testApiDefinitionsJson as Document[], {
      dataSourcesPath: path.resolve(__dirname, './fixtures/test-datasource.js')
    });
  });

  test('Should allow put a template', async () => {
    bautajs.services.testService.v1.operation1.setup(p => {
      p.push(() => '1').push(template([{ id: '{{ctx.req.id}}', name: '{{previousValue}}' }]));
    });

    expect(
      await bautajs.services.testService.v1.operation1.run({ req: { id: 1 }, res: {} })
    ).toEqual([{ id: 1, name: '1' }]);
  });

  test('Should bypass not valid template', async () => {
    bautajs.services.testService.v1.operation1.validateResponse(false).setup(p => {
      p.push(() => '1').push(template(undefined));
    });

    expect(
      await bautajs.services.testService.v1.operation1.run({ req: { id: 1 }, res: {} })
    ).toEqual(undefined);
  });
});