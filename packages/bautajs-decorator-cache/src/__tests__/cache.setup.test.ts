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
import { BautaJS, pipelineBuilder, BautaJSInstance, OpenAPIV3Document } from '@bautajs/core';
import moize from 'moize';
import { cache } from '../index';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';

jest.mock('moize');

describe('cache push', () => {
  let bautajs: BautaJSInstance;
  beforeEach(async () => {
    jest.clearAllMocks();

    bautajs = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[]);
    await bautajs.bootstrap();
  });

  test('should pass the required internal options to moize fn', () => {
    const pp = pipelineBuilder(p =>
      p.push(() => [{ a: '123' }]).push((result: any) => ({ ...result[0], new: 1 }))
    );
    const normalizer = ([, ctx]) => ctx.id;
    bautajs.operations.v1.operation1.setup(p => p.push(cache(pp, <any>normalizer)));

    expect(moize).toHaveBeenCalledWith(
      pp,
      expect.objectContaining({
        matchesKey: expect.any(Function),
        onCacheHit: expect.any(Function),
        onCacheAdd: expect.any(Function),
        maxSize: 25
      })
    );
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
    expect(moize).toHaveBeenCalledWith(
      pp,
      expect.objectContaining({
        maxAge: 1000,
        maxSize: 14
      })
    );
  });

  test('should ignore the options onCacheHit, onCacheAdd, matchesKey since they are used by cache-decorator', () => {
    const pp = pipelineBuilder(p =>
      p.push(() => [{ a: '123' }]).push((result: any) => ({ ...result[0], new: 1 }))
    );
    const normalizer = ([, ctx]) => ctx.id;
    bautajs.operations.v1.operation1.setup(p =>
      p.push(
        cache(pp, <any>normalizer, {
          // @ts-ignore
          matchesKey: 'potato1',
          // @ts-ignore
          onCacheHit: 'potato2',
          // @ts-ignore
          onCacheAdd: 'potato3'
        })
      )
    );

    expect(moize).toHaveBeenCalledWith(
      pp,
      expect.objectContaining({
        matchesKey: expect.any(Function),
        onCacheHit: expect.any(Function),
        onCacheAdd: expect.any(Function),
        maxSize: 25
      })
    );
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
