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
import { BautaJS, OpenAPIV3Document, pipelineBuilder, BautaJSInstance } from '@bautajs/core';
import { cache, CacheOperatorFunction } from '../index';
import { Normalizer } from '../types';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';
import { sleep } from './utils';

describe('cache decorator usage', () => {
  let bautaJS: BautaJSInstance;
  let myCachePipeline: CacheOperatorFunction<any, any, any>;

  beforeAll(() => {
    process.env.LOG_LEVEL = 'debug';
    process.env.DEBUG = 'bautajs*';
  });

  describe('normalizer using context req param', () => {
    beforeEach(async () => {
      bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[]);
      await bautaJS.bootstrap();

      const normalizer: Normalizer<any, any> = (_, ctx) => ctx.req.params.value;

      const pp = pipelineBuilder(p =>
        p.pipe(
          (_, ctx) => {
            return ctx.req.params.value;
          },
          value => ({ a: '123', b: value }),
          result => ({ ...result, new: 1 })
        )
      );
      myCachePipeline = cache(pp, normalizer, { maxSize: 5 });

      bautaJS.operations.v1.operation2.setup(p => p.pipe(myCachePipeline));
    });

    afterEach(() => {
      myCachePipeline.store.clear();
    });

    test('should be called with one add cache hit for first value', async () => {
      const spy = jest.spyOn(myCachePipeline.store, 'set');
      await bautaJS.operations.v1.operation2.run({
        req: { params: { value: 144 } },
        res: {}
      });

      await bautaJS.operations.v1.operation2.run({
        req: { params: { value: 144 } },
        res: {}
      });

      expect(myCachePipeline.store.get(144)).toStrictEqual({ a: '123', b: 144, new: 1 });
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('should save more than one cache item if the key (req.param) is different', async () => {
      const spy = jest.spyOn(myCachePipeline.store, 'set');
      await bautaJS.operations.v1.operation2.run({
        req: { params: { value: 144 } },
        res: {}
      });

      await bautaJS.operations.v1.operation2.run({
        req: { params: { value: 200 } },
        res: {}
      });

      expect(myCachePipeline.store.get(144)).toStrictEqual({ a: '123', b: 144, new: 1 });
      expect(myCachePipeline.store.get(200)).toStrictEqual({ a: '123', b: 200, new: 1 });
      expect(spy).toHaveBeenCalledTimes(2);
    });

    test('user should be able to clear the cache', async () => {
      const spy = jest.spyOn(myCachePipeline.store, 'set');
      await bautaJS.operations.v1.operation2.run({
        req: { params: { value: 144 } },
        res: {}
      });

      myCachePipeline.store.clear();

      expect(myCachePipeline.store.size).toStrictEqual(0);

      await bautaJS.operations.v1.operation2.run({
        req: { params: { value: 144 } },
        res: {}
      });

      expect(myCachePipeline.store.get(144)).toStrictEqual({ a: '123', b: 144, new: 1 });
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('cache with expiration time of 10 millisecond', () => {
    beforeEach(async () => {
      bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[]);
      await bautaJS.bootstrap();

      const normalizer: Normalizer<any, any> = (_, ctx) => ctx.req.params.value;

      const pp = pipelineBuilder(p =>
        p.pipe(
          (_, ctx) => {
            return ctx.req.params.value;
          },
          value => ({ a: '123', b: value }),
          result => ({ ...result, new: 1 })
        )
      );
      myCachePipeline = cache(pp, <any>normalizer, { maxSize: 5, maxAge: 10 });

      bautaJS.operations.v1.operation2.setup(p => p.pipe(myCachePipeline));
    });

    afterEach(() => {
      myCachePipeline.store.clear();
    });

    test('as the expiration time is 10 millisecond, the second call should not be cached', async () => {
      const spy = jest.spyOn(myCachePipeline.store, 'set');
      await bautaJS.operations.v1.operation2.run({
        req: { params: { value: 144 } },
        res: {}
      });
      await sleep(100);
      await bautaJS.operations.v1.operation2.run({
        req: { params: { value: 144 } },
        res: {}
      });

      expect(myCachePipeline.store.get(144)).toStrictEqual({ a: '123', b: 144, new: 1 });
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('cache with only 1 slot', () => {
    beforeEach(async () => {
      bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[]);
      await bautaJS.bootstrap();

      const normalizer: Normalizer<any, any> = (_, ctx) => ctx.req.params.value;

      const pp = pipelineBuilder(p =>
        p.pipe(
          (_, ctx) => {
            return ctx.req.params.value;
          },
          value => ({ a: '123', b: value }),
          result => ({ ...result, new: 1 })
        )
      );
      myCachePipeline = cache(pp, <any>normalizer, { maxSize: 1 });

      bautaJS.operations.v1.operation2.setup(p => p.pipe(myCachePipeline));
    });

    afterEach(() => {
      myCachePipeline.store.clear();
    });

    test('cache max size should be respected', async () => {
      const spy = jest.spyOn(myCachePipeline.store, 'set');
      await bautaJS.operations.v1.operation2.run({
        req: { params: { value: 144 } },
        res: {}
      });

      await bautaJS.operations.v1.operation2.run({
        req: { params: { value: 244 } },
        res: {}
      });

      await bautaJS.operations.v1.operation2.run({
        req: { params: { value: 144 } },
        res: {}
      });

      expect(myCachePipeline.store.get(144)).toStrictEqual({ a: '123', b: 144, new: 1 });
      expect(spy).toHaveBeenCalledTimes(3);
    });
  });
});
