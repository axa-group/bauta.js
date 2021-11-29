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
import { pipe, BautaJSInstance, createContext } from '@axa-group/bautajs-core';
import { cache } from '../index';
import { sleep } from './utils';

describe('cache setup', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  test('should create a default cache without ttl', async () => {
    const pp = pipe(
      () => [{ a: '123' }],
      (result: any) => ({ ...result[0], new: 1 })
    );
    const myCachePipeline = cache(pp, { maxSize: 4 }, (_, ctx) => ctx.id || 'someId');

    await myCachePipeline(null, createContext({}), {} as BautaJSInstance);

    expect(myCachePipeline.store.size).toBe(1);
  });

  test('should create a cache with ttl if maxAge is passed', async () => {
    const pp = pipe(
      () => [{ a: '123' }],
      (result: any) => ({ ...result[0], new: 1 })
    );
    const myCachePipeline = cache(pp, { maxSize: 10, maxAge: 200 }, (_, ctx) => ctx.id || 'someId');

    await myCachePipeline(null, createContext({ id: 'test' }), {} as BautaJSInstance);
    expect(myCachePipeline.store.get('test')).toStrictEqual({
      a: '123',
      new: 1
    });
    await sleep(300);
    expect(myCachePipeline.store.get('test')).toBeUndefined();
  });
});
