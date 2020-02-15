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
import nock from 'nock';
import { BautaJS, Document } from '@bautajs/core/src';
import testDatasource from './fixtures/test-datasource';

const testApiDefinitionsJson = require('./fixtures/test-api-definitions.json');

describe('request decorator', () => {
  let bautajs: BautaJS;
  beforeEach(() => {
    nock('https://google.com')
      .persist()
      .get('/')
      .reply(200, [{ id: 3, name: 'pet3' }]);

    bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('should do a request', async () => {
    bautajs.operations.v1.operation1.validateResponses(false).setup(p => {
      p.push(testDatasource.operation1());
    });

    expect(await bautajs.operations.v1.operation1.run({ req: { id: 1 }, res: {} })).toStrictEqual([
      { id: 3, name: 'pet3' }
    ]);
  });

  test('should do a request and get the full response if resolveBodyOnly is false', async () => {
    bautajs.operations.v1.operation1.validateResponses(false).setup(p => {
      p.push(testDatasource.operation1({ resolveBodyOnly: false }));
    });

    const response = await bautajs.operations.v1.operation1.run({
      req: { id: 1 },
      res: {}
    });

    expect(response.body).toStrictEqual([{ id: 3, name: 'pet3' }]);
  });
});
