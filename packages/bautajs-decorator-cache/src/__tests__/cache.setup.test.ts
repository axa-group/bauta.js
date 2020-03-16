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
import { BautaJS, Document, pipelineBuilder, BautaJSInstance } from '@bautajs/core';

import moize from 'moize';

import { cache } from '../index';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';

jest.mock('moize');

describe('cache push', () => {
  let bautajs: BautaJSInstance;
  beforeEach(async () => {
    jest.clearAllMocks();

    bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
    await bautajs.bootstrap();
  });

  test('should pass the required internal options to moize fn', () => {
    const pp = pipelineBuilder(p =>
      p.push(() => [{ a: '123' }]).push((result: any) => ({ ...result[0], new: 1 }))
    );
    const normalizer = ([, ctx]) => ctx.id;
    bautajs.operations.v1.operation1.setup(p => p.push(cache(pp, <any>normalizer)));

    expect(moize.mock.calls[0][0]).toStrictEqual(pp);
    expect(moize.mock.calls[0][1]).toMatchObject({
      matchesKey: expect.any(Function),
      onCacheHit: expect.any(Function),
      onCacheAdd: expect.any(Function),
      maxSize: 25
    });
  });

  test('should pass the options to memoize fn', () => {
    const pp = pipelineBuilder(p =>
      p.push(() => [{ a: '123' }]).push((result: any) => ({ ...result[0], new: 1 }))
    );
    const normalizer = ([, ctx]) => ctx.id;
    bautajs.operations.v1.operation1.setup(p =>
      p.push(
        cache(pp, <any>normalizer, {
          maxAge: 1000,
          maxSize: 14
        })
      )
    );
    expect(moize.mock.calls[0][0]).toStrictEqual(pp);
    expect(moize.mock.calls[0][1]).toMatchObject({
      maxAge: 1000,
      maxSize: 14
    });
  });

  test('should ignore the options onCacheHit, onCacheAdd, matchesKey since they are used by cache-decorator', () => {
    const pp = pipelineBuilder(p =>
      p.push(() => [{ a: '123' }]).push((result: any) => ({ ...result[0], new: 1 }))
    );
    const normalizer = ([, ctx]) => ctx.id;
    bautajs.operations.v1.operation1.setup(p =>
      p.push(
        cache(pp, <any>normalizer, {
          matchesKey: 'potato1',
          onCacheHit: 'potato2',
          onCacheAdd: 'potato3'
        })
      )
    );

    expect(moize.mock.calls[0][0]).toStrictEqual(pp);
    expect(moize.mock.calls[0][1]).toMatchObject({
      matchesKey: expect.any(Function),
      onCacheHit: expect.any(Function),
      onCacheAdd: expect.any(Function),
      maxSize: 25
    });
  });

  test('should throw an error if normalizer function is not specified', async () => {
    const pp = pipelineBuilder(p =>
      p.push(() => [{ a: '123' }]).push((result: any) => ({ ...result[0], new: 1 }))
    );

    expect(() =>
      bautajs.operations.v1.operation1.setup(p =>
        p.push(
          // @ts-ignore
          cache(pp)
        )
      )
    ).toThrow(
      'normalizer: ([prev, ctx, bautajs])=>{ //return key;} function is a mandatory parameter to calculate the cache key'
    );
  });
});
