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
import nock from 'nock';
import { resolve } from 'path';
import { BautaJS, Document } from '@bautajs/core/src';
import { compileDataSource } from '../decorators/compile-datasource';

const testApiDefinitionsJson = require('./fixtures/test-api-definitions.json');

describe('Compile datasource decorator', () => {
  let bautajs: BautaJS;
  const path = 'cats';
  beforeEach(() => {
    nock('https://google.com')
      .get(`/${path}`)
      .reply(200, [{ id: 3, name: 'pet3' }]);

    bautajs = new BautaJS(testApiDefinitionsJson as Document[], {
      dataSourcesPath: resolve(__dirname, './fixtures/test-datasource-dynamic.js')
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('Should compile de datasource and do the request to a dynamic url', async () => {
    bautajs.services.testService.v1.operation1.validateResponse(false).setup(p => {
      p.push((_, ctx) => {
        ctx.data.path = path;
      });
      p.push(
        compileDataSource((_, _ctx, dataSource) => {
          return dataSource.request({ resolveBodyOnly: true });
        })
      );
    });

    expect(
      await bautajs.services.testService.v1.operation1.run({ req: { id: 1 }, res: {} })
    ).toEqual([{ id: 3, name: 'pet3' }]);
  });
});
