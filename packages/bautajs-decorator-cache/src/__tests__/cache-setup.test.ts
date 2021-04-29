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
import { BautaJS, pipe, BautaJSInstance, OpenAPIV3Document } from '@bautajs/core';
import { cache } from '../index';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';
import { sleep } from './utils';

describe('cache setup', () => {
  let bautajs: BautaJSInstance;
  beforeEach(async () => {
    jest.clearAllMocks();

    bautajs = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[]);
    await bautajs.bootstrap();
  });

  test('should create a default cache without ttl', async () => {
    const pp = pipe(
      () => [{ a: '123' }],
      (result: any) => ({ ...result[0], new: 1 })
    );
    const myCachePipeline = cache(pp, (_, ctx) => ctx.id || 'someId', { maxSize: 4 });
    bautajs.operations.v1.operation1.setup(myCachePipeline);
    await bautajs.operations.v1.operation1.run({ req: {}, res: {} });

    expect(myCachePipeline.store.size).toStrictEqual(1);
  });

  test('should create a cache with ttl if maxAge is passed', async () => {
    const pp = pipe(
      () => [{ a: '123' }],
      (result: any) => ({ ...result[0], new: 1 })
    );
    const myCachePipeline = cache(pp, (_, ctx) => ctx.id || 'someId', { maxSize: 10, maxAge: 200 });
    bautajs.operations.v1.operation1.setup(myCachePipeline);

    await bautajs.operations.v1.operation1.run({ id: 'test', req: { id: 'test' }, res: {} });
    expect(myCachePipeline.store.get('test')).toStrictEqual({
      a: '123',
      new: 1
    });
    await sleep(300);
    expect(myCachePipeline.store.get('test')).toBeUndefined();
  });
});
