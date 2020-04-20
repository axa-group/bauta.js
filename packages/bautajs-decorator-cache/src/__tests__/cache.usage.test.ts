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
//
import {
  BautaJS,
  OpenAPIV3Document,
  pipelineBuilder,
  BautaJSInstance,
  Logger
} from '@bautajs/core';
import pino from 'pino';
import { cache } from '../index';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';

describe('cache decorator usage', () => {
  let bautaJS: BautaJSInstance;

  beforeAll(() => {
    process.env.LOG_LEVEL = 'debug';
    process.env.DEBUG = 'bautajs*';
  });

  describe('using default logger', () => {
    describe('normalizer using context', () => {
      beforeEach(async () => {
        jest.resetModules();

        bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[]);
        await bautaJS.bootstrap();

        const normalizer = ([, ctx]) => ctx.req.params.value;

        const pp = pipelineBuilder(p =>
          p
            .push((_, ctx) => {
              return ctx.req.params.value;
            })
            .push(value => ({ a: '123', b: value }))
            .push(result => ({ ...result, new: 1 }))
        );

        bautaJS.operations.v1.operation2.setup(p => p.push(cache(pp, <any>normalizer)));
      });

      test('should be called with one add cache hit for first value', async () => {
        const result = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result).toStrictEqual({ a: '123', b: 144, new: 1 });
      });

      test('should be called with one cache hit for the same value', async () => {
        const result = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result).toStrictEqual({ a: '123', b: 144, new: 1 });

        const result2 = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result2).toStrictEqual({ a: '123', b: 144, new: 1 });
      });

      test('should be called with no cache hit for different values', async () => {
        const result = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result).toStrictEqual({ a: '123', b: 144, new: 1 });

        const result2 = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 255 } },
          res: {}
        });

        expect(result2).toStrictEqual({ a: '123', b: 255, new: 1 });

        const result3 = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 255 } },
          res: {}
        });

        expect(result3).toStrictEqual({ a: '123', b: 255, new: 1 });

        const result4 = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result4).toStrictEqual({ a: '123', b: 144, new: 1 });

        const result5 = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 'mechants' } },
          res: {}
        });

        expect(result5).toStrictEqual({ a: '123', b: 'mechants', new: 1 });
      });
    });

    describe('normalizer using first param object', () => {
      beforeEach(async () => {
        jest.resetModules();

        bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[]);
        await bautaJS.bootstrap();

        const normalizer = ([obj]) => {
          return obj.b;
        };

        const pp = pipelineBuilder(p =>
          p
            .push((_, ctx) => {
              return ctx.req.params.value;
            })
            .push(value => ({ a: '123', b: value }))
            .push(result => ({ ...result, new: 1 }))
        );

        bautaJS.operations.v1.operation2.setup(p =>
          p
            .push((_, ctx) => {
              return { b: ctx.req.params.value };
            })
            .push(cache(pp, <any>normalizer))
        );
      });

      test('should be called with one add cache hit for first value', async () => {
        const result = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result).toStrictEqual({ a: '123', b: 144, new: 1 });
      });

      test('should be called with one cache hit for the same value', async () => {
        const result = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result).toStrictEqual({ a: '123', b: 144, new: 1 });

        const result2 = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result2).toStrictEqual({ a: '123', b: 144, new: 1 });
      });

      test('should be called with no cache hit for different values', async () => {
        const result = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result).toStrictEqual({ a: '123', b: 144, new: 1 });

        const result2 = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 255 } },
          res: {}
        });

        expect(result2).toStrictEqual({ a: '123', b: 255, new: 1 });

        const result3 = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 255 } },
          res: {}
        });

        expect(result3).toStrictEqual({ a: '123', b: 255, new: 1 });

        const result4 = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result4).toStrictEqual({ a: '123', b: 144, new: 1 });

        const result5 = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 'mechants' } },
          res: {}
        });

        expect(result5).toStrictEqual({ a: '123', b: 'mechants', new: 1 });
      });
    });
  });

  describe('using custom logger', () => {
    let validLogger: Logger;

    describe('normalizer using context', () => {
      beforeEach(async () => {
        jest.resetModules();

        const configLogger = {
          level: 'debug',
          name: 'logger-custom-test',
          prettyPrint: false
        };

        validLogger = (pino(configLogger, pino.destination(1)) as unknown) as Logger;

        bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[]);
        await bautaJS.bootstrap();

        const normalizer = ([, ctx]) => ctx.req.params.value;

        const pp = pipelineBuilder(p =>
          p
            .push((_, ctx) => {
              return ctx.req.params.value;
            })
            .push(value => ({ a: '123', b: value }))
            .push(result => ({ ...result, new: 1 }))
        );

        bautaJS.operations.v1.operation2.setup(p =>
          p.push(cache(pp, <any>normalizer, null, validLogger))
        );
      });

      test('should be called with one add cache hit for first value', async () => {
        const spyOnDebug = jest.spyOn(validLogger, 'debug');
        const spyOnTrace = jest.spyOn(validLogger, 'trace');
        const result = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result).toStrictEqual({ a: '123', b: 144, new: 1 });
        expect(spyOnDebug).toHaveBeenNthCalledWith(1, 'Cache added key 144 size 1');
        expect(spyOnTrace).not.toHaveBeenCalled();
      });

      test('should be called with one cache hit for the same value', async () => {
        const spyOnInfo = jest.spyOn(validLogger, 'info');
        const spyOnTrace = jest.spyOn(validLogger, 'trace');

        await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        const result = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result).toStrictEqual({ a: '123', b: 144, new: 1 });
        expect(spyOnInfo).toHaveBeenNthCalledWith(1, 'Cache hit in cache with keys 144');
        expect(spyOnTrace).not.toHaveBeenCalled();
      });

      test('should be called with no cache hit for different values', async () => {
        const spyOnDebug = jest.spyOn(validLogger, 'debug');
        const spyOnTrace = jest.spyOn(validLogger, 'trace');

        const result = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        const result2 = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 255 } },
          res: {}
        });

        expect(result).toStrictEqual({ a: '123', b: 144, new: 1 });
        expect(result2).toStrictEqual({ a: '123', b: 255, new: 1 });
        expect(spyOnDebug).toHaveBeenNthCalledWith(1, 'Cache added key 144 size 1');
        expect(spyOnDebug).toHaveBeenNthCalledWith(2, 'Cache added key 255 size 2');

        expect(spyOnTrace).not.toHaveBeenCalled();
      });

      test('should be called with cache hit for each existing value in the cache', async () => {
        const spyOnInfo = jest.spyOn(validLogger, 'info');
        const spyOnTrace = jest.spyOn(validLogger, 'trace');
        await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 255 } },
          res: {}
        });

        const result = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 255 } },
          res: {}
        });

        expect(result).toStrictEqual({ a: '123', b: 255, new: 1 });

        const result2 = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result2).toStrictEqual({ a: '123', b: 144, new: 1 });

        expect(spyOnInfo).toHaveBeenNthCalledWith(1, 'Cache hit in cache with keys 255,144');

        expect(spyOnInfo).toHaveBeenNthCalledWith(2, 'Cache hit in cache with keys 255,144');

        expect(spyOnTrace).not.toHaveBeenCalled();
      });
    });

    describe('normalizer using first param object', () => {
      beforeEach(async () => {
        jest.resetModules();

        const configLogger = {
          level: 'debug',
          name: 'logger-custom-test',
          prettyPrint: false
        };

        validLogger = (pino(configLogger, pino.destination(1)) as unknown) as Logger;

        bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[]);
        await bautaJS.bootstrap();

        const normalizer = ([obj]) => {
          return obj.b;
        };

        const pp = pipelineBuilder(p =>
          p
            .push((_, ctx) => {
              return ctx.req.params.value;
            })
            .push(value => ({ a: '123', b: value }))
            .push(result => ({ ...result, new: 1 }))
        );

        bautaJS.operations.v1.operation2.setup(p =>
          p
            .push((_, ctx) => {
              return { b: ctx.req.params.value };
            })
            .push(cache(pp, <any>normalizer, null, validLogger))
        );
      });

      test('should be called with one add cache hit for first value', async () => {
        const spyOnDebug = jest.spyOn(validLogger, 'debug');
        const spyOnTrace = jest.spyOn(validLogger, 'trace');
        const result = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result).toStrictEqual({ a: '123', b: 144, new: 1 });
        expect(spyOnDebug).toHaveBeenNthCalledWith(1, 'Cache added key 144 size 1');
        expect(spyOnTrace).not.toHaveBeenCalled();
      });

      test('should be called with one cache hit for the same value', async () => {
        const spyOnInfo = jest.spyOn(validLogger, 'info');
        const spyOnTrace = jest.spyOn(validLogger, 'trace');

        await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        const result = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result).toStrictEqual({ a: '123', b: 144, new: 1 });
        expect(spyOnInfo).toHaveBeenNthCalledWith(1, 'Cache hit in cache with keys 144');
        expect(spyOnTrace).not.toHaveBeenCalled();
      });
    });
  });

  describe('using trace debug', () => {
    let validLogger: Logger;

    describe('normalizer using context', () => {
      beforeEach(async () => {
        jest.resetModules();

        process.env.LOG_LEVEL = 'trace';
        process.env.DEBUG = 'bautajs*';

        // eslint-disable-next-line global-require
        const { cache: myCache } = require('../index');

        const configLogger = {
          level: 'debug',
          name: 'logger-custom-test',
          prettyPrint: false
        };

        validLogger = (pino(configLogger, pino.destination(1)) as unknown) as Logger;

        bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[]);
        await bautaJS.bootstrap();

        const normalizer = ([, ctx]) => ctx.req.params.value;

        const pp = pipelineBuilder(p =>
          p
            .push((_, ctx) => {
              return ctx.req.params.value;
            })
            .push(value => ({ a: '123', b: value }))
            .push(result => ({ ...result, new: 1 }))
        );

        bautaJS.operations.v1.operation2.setup(p =>
          p.push(myCache(pp, <any>normalizer, null, validLogger))
        );
      });

      test('should be called with one add cache hit for first value', async () => {
        const spyOnDebug = jest.spyOn(validLogger, 'debug');
        const spyOnTrace = jest.spyOn(validLogger, 'trace');
        const result = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result).toStrictEqual({ a: '123', b: 144, new: 1 });
        expect(spyOnDebug).toHaveBeenNthCalledWith(1, 'Cache added key 144 size 1');
        expect(spyOnTrace).toHaveBeenNthCalledWith(1, 'Cache added key 144 value %o size 1', {
          a: '123',
          b: 144,
          new: 1
        });
      });

      test('should be called with one cache hit for the same value', async () => {
        const spyOnInfo = jest.spyOn(validLogger, 'info');
        const spyOnTrace = jest.spyOn(validLogger, 'trace');

        await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        const result = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result).toStrictEqual({ a: '123', b: 144, new: 1 });
        expect(spyOnInfo).toHaveBeenNthCalledWith(1, 'Cache hit in cache with keys 144');
        expect(spyOnTrace).toHaveBeenNthCalledWith(1, 'Cache added key 144 value %o size 1', {
          a: '123',
          b: 144,
          new: 1
        });
        expect(spyOnTrace).toHaveBeenNthCalledWith(
          2,
          'Cache hit in cache with keys 144 values %o',
          [{ a: '123', b: 144, new: 1 }]
        );
      });
    });

    describe('normalizer using first param object', () => {
      beforeEach(async () => {
        jest.resetModules();

        process.env.LOG_LEVEL = 'trace';
        process.env.DEBUG = 'bautajs*';

        // eslint-disable-next-line global-require
        const { cache: myCache } = require('../index');

        const configLogger = {
          level: 'debug',
          name: 'logger-custom-test',
          prettyPrint: false
        };

        validLogger = (pino(configLogger, pino.destination(1)) as unknown) as Logger;

        bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[]);
        await bautaJS.bootstrap();

        const normalizer = ([obj]) => {
          return obj.b;
        };

        const pp = pipelineBuilder(p =>
          p
            .push((_, ctx) => {
              return ctx.req.params.value;
            })
            .push(value => ({ a: '123', b: value }))
            .push(result => ({ ...result, new: 1 }))
        );

        bautaJS.operations.v1.operation2.setup(p =>
          p
            .push((_, ctx) => {
              return { b: ctx.req.params.value };
            })
            .push(myCache(pp, <any>normalizer, null, validLogger))
        );
      });

      test('should be called with one add cache hit for first value', async () => {
        const spyOnDebug = jest.spyOn(validLogger, 'debug');
        const spyOnTrace = jest.spyOn(validLogger, 'trace');
        const result = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result).toStrictEqual({ a: '123', b: 144, new: 1 });
        expect(spyOnDebug).toHaveBeenNthCalledWith(1, 'Cache added key 144 size 1');
        expect(spyOnTrace).toHaveBeenNthCalledWith(1, 'Cache added key 144 value %o size 1', {
          a: '123',
          b: 144,
          new: 1
        });
      });

      test('should be called with one cache hit for the same value', async () => {
        const spyOnInfo = jest.spyOn(validLogger, 'info');
        const spyOnTrace = jest.spyOn(validLogger, 'trace');

        await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        const result = await bautaJS.operations.v1.operation2.run({
          req: { params: { value: 144 } },
          res: {}
        });

        expect(result).toStrictEqual({ a: '123', b: 144, new: 1 });
        expect(spyOnInfo).toHaveBeenNthCalledWith(1, 'Cache hit in cache with keys 144');
        expect(spyOnTrace).toHaveBeenNthCalledWith(1, 'Cache added key 144 value %o size 1', {
          a: '123',
          b: 144,
          new: 1
        });
        expect(spyOnTrace).toHaveBeenNthCalledWith(
          2,
          'Cache hit in cache with keys 144 values %o',
          [{ a: '123', b: 144, new: 1 }]
        );
      });
    });
  });
});
