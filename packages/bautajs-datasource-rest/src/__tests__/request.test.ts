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
/* global expect, describe, test, beforeEach, afterEach */
import nock from 'nock';
import { resolve } from 'path';
import { BautaJS, Document } from '@bautajs/core/src';
import { request } from '../decorators/request';

const testApiDefinitionsJson = require('./fixtures/test-api-definitions.json');

describe('Request decorator', () => {
  let bautajs: BautaJS;
  beforeEach(() => {
    nock('https://google.com')
      .persist()
      .get('/')
      .reply(200, [{ id: 3, name: 'pet3' }]);

    bautajs = new BautaJS(testApiDefinitionsJson as Document[], {
      dataSourcesPath: resolve(__dirname, './fixtures/test-datasource.js')
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('Should do a request', async () => {
    bautajs.services.testService.v1.operation1.validateResponse(false).setup(p => {
      p.push(request());
    });

    expect(
      await bautajs.services.testService.v1.operation1.run({ req: { id: 1 }, res: {} })
    ).toEqual([{ id: 3, name: 'pet3' }]);
  });

  test('Should do a request and get the full response if resolveBodyOnly is false', async () => {
    bautajs.services.testService.v1.operation1.validateResponse(false).setup(p => {
      p.push(request({ resolveBodyOnly: false }));
    });

    const response = await bautajs.services.testService.v1.operation1.run({
      req: { id: 1 },
      res: {}
    });

    expect(response.body).toEqual([{ id: 3, name: 'pet3' }]);
  });
});
