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
/* global expect, describe, test, jest, beforeEach, afterEach */
import nock from 'nock';
import path from 'path';
import { BautaJS, Document } from '@bautajs/core';
import { cache } from '../index';

const testApiDefinitionsJson = require('./fixtures/test-api-definitions.json');

describe('Cache push', () => {
  let bautajs: BautaJS<{}, {}>;
  beforeEach(() => {
    jest.useFakeTimers();
    nock('https://google.com')
      .persist()
      .get('/')
      .reply(200, [{ id: 3, name: 'pet3' }]);

    bautajs = new BautaJS(testApiDefinitionsJson as Document[], {
      dataSourcesPath: path.resolve(__dirname, './fixtures/test-datasource.json')
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('Should cache the requests with the same id', async () => {
    const fn = jest.fn(() => [{ id: 1, name: 'pet' }]);
    bautajs.services.testService.v1.operation1.setup(pipeline =>
      pipeline.push(
        cache(
          p =>
            p
              .push((value, ctx) => ctx.dataSource(value).request({ resolveBodyOnly: true }))
              .push((result: any) => ({ ...result[0], new: 1 }))
              .push(fn),
          ([, ctx]) => ctx.id
        )
      )
    );

    await bautajs.services.testService.v1.operation1.run({ req: { id: 1 }, res: {} });
    await bautajs.services.testService.v1.operation1.run({ req: { id: 1 }, res: {} });

    expect(fn.mock.calls.length).toBe(1);
  });

  test('Should allow memoizee options', async () => {
    const fn = jest.fn(() => [{ id: 1, name: 'pet' }]);
    bautajs.services.testService.v1.operation1.setup(pipeline =>
      pipeline.push(
        cache(
          p =>
            p
              .push((value, ctx) => ctx.dataSource(value).request({ resolveBodyOnly: true }))
              .push((result: any) => ({ ...result[0], new: 1 }))
              .push(fn),
          ([, ctx]) => ctx.id,
          {
            maxAge: 1000
          }
        )
      )
    );
    jest.runAllTimers();
    await bautajs.services.testService.v1.operation1.run({ req: { id: 1 }, res: {} });
    jest.runAllTimers();
    await bautajs.services.testService.v1.operation1.run({ req: { id: 1 }, res: {} });
    jest.runAllTimers();
    expect(fn.mock.calls.length).toBe(2);
  });

  test('Should throw an error if normalizer function is not specified', async () => {
    expect(() =>
      bautajs.services.testService.v1.operation1.setup(pipeline =>
        pipeline.push(
          // @ts-ignore
          cache(p => p.push((value: any, ctx: any) => ctx.dataSource(value).request()))
        )
      )
    ).toThrow(
      'normalizer: (args)=>{} function is a mandatory parameter to calculate the cache key'
    );
  });
});
