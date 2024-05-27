/* eslint-disable global-require */

import nock from 'nock';
import {
  BautaJS,
  BautaJSInstance,
  createContext,
  defaultLogger,
  Logger,
  pipe,
  Document
} from '@axa/bautajs-core';
import { CancelableRequest, RequestError } from 'got';
import { Readable } from 'stream';
import { jest } from '@jest/globals';

describe('provider rest', () => {
  let bautajs: BautaJSInstance;

  beforeEach(async () => {
    bautajs = new BautaJS();
    await bautajs.bootstrap();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('restProvider extend', () => {
    test('should allow to create your own rest provider', async () => {
      const { restProvider } = await import('../src/index');

      const Id = '123';
      nock('https://google.com').get(`/${Id}`).reply(200, 'text');

      const myTxtRestProvider = restProvider.extend({ responseType: 'text' });
      const provider = myTxtRestProvider((client, _, ctx) => {
        return client.get(`https://google.com/${ctx.data.myId}`);
      });

      const pipeline = pipe((_, ctx) => {
        ctx.data.myId = Id;
      }, provider());
      const response = await pipeline(
        null,
        createContext({
          req: { id: 1 },
          res: { statusCode: 200 }
        }),
        bautajs
      );

      expect(response).toBe('text');
    });
  });

  describe('got extends defaults', () => {
    test('should allow do a requests with GOT options and the built in agent', async () => {
      const { restProvider } = await import('../src/index');

      const Id = '123';
      nock('https://google.com')
        .get(`/${Id}`)
        .reply(200, [{ id: 3, name: 'pet3' }]);

      const provider = restProvider((client, _, ctx) => {
        return client.get(`https://google.com/${ctx.data.myId}`, { responseType: 'json' });
      });

      const pipeline = pipe((_, ctx) => {
        ctx.data.myId = Id;
      }, provider());

      const response = await pipeline(
        null,
        createContext({
          req: { id: 1 },
          res: { statusCode: 200 }
        }),
        bautajs
      );
      expect(response).toStrictEqual([{ id: 3, name: 'pet3' }]);
    });

    test('should add the response status code if an http error ocurres', async () => {
      const { restProvider } = await import('../src/index');

      const Id = '123';
      nock('https://google.com').get(`/${Id}`).reply(404, { message: 'not found' });

      const provider = restProvider((client, _, ctx) => {
        return client.get(`https://google.com/${ctx.data.myId}`, { responseType: 'json' });
      });

      const pipeline = pipe((_, ctx) => {
        ctx.data.myId = Id;
      }, provider());

      await expect(
        pipeline(
          null,
          createContext({
            req: { id: 1 },
            res: { statusCode: 200 }
          }),
          bautajs
        )
      ).rejects.toThrow(expect.objectContaining({ statusCode: 404, message: 'not found' }));
    });

    test('should add the response status code if an http error ocurres and message should be case insensitive', async () => {
      const { restProvider } = await import('../src/index');

      const Id = '123';
      nock('https://google.com').get(`/${Id}`).reply(404, { Message: 'not found' });

      const provider = restProvider((client, _, ctx) => {
        return client.get(`https://google.com/${ctx.data.myId}`, { responseType: 'json' });
      });

      const pipeline = pipe((_, ctx) => {
        ctx.data.myId = Id;
      }, provider());

      await expect(
        pipeline(
          null,
          createContext({
            req: { id: 1 },
            res: { statusCode: 200 }
          }),
          bautajs
        )
      ).rejects.toThrow(expect.objectContaining({ statusCode: 404, message: 'not found' }));
    });

    test('should allow do a requests with GOT options and the built in agent with de default set up', async () => {
      const { restProvider } = await import('../src/index');
      const Id = '123';
      nock('https://google.com')
        .get(`/${Id}`)
        .reply(200, [{ id: 3, name: 'pet3' }]);

      const provider = restProvider((client, _, ctx) => {
        return client.get(`https://google.com/${ctx.data.myId}`);
      });
      const pipeline = pipe((_, ctx) => {
        ctx.data.myId = Id;
      }, provider());
      const response = await pipeline(
        null,
        createContext({
          req: { id: 1 },
          res: { statusCode: 200 }
        }),
        bautajs
      );

      expect(response).toStrictEqual([{ id: 3, name: 'pet3' }]);
    });
  });

  describe('request cancellation', () => {
    test('should cancel the request if the a cancel is executed', async () => {
      const { restProvider } = await import('../src/index');
      nock('http://pets.com').get('/v1/policies').reply(200, {});

      const myContext = createContext({ req: {}, res: {}, log: bautajs.logger });
      const provider = restProvider(client => {
        return client.get('http://pets.com/v1/policies', { responseType: 'json' });
      });
      const request1 = provider()(null, myContext, bautajs);

      myContext.token.cancel();

      await expect(request1).rejects.toThrow(
        expect.objectContaining({ message: 'Promise was canceled' })
      );
      expect((request1 as CancelableRequest<any>).isCanceled).toBe(true);
    });

    test('should cancel the request if the a cancel is executed and the request is an stream', async () => {
      const { restProvider } = await import('../src/index');
      nock('http://pets.com').get('/v1/policies').reply(200, {});

      const myContext = createContext({ req: {}, res: {}, log: bautajs.logger });
      const provider = restProvider(client => {
        return client.stream('http://pets.com/v1/policies', { responseType: 'json' });
      });
      const request1 = provider()(null, myContext, bautajs);

      myContext.token.cancel();
      await request1;
      expect((request1 as any).destroyed).toBe(true);
    });
  });

  describe('logger tests', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    test('should log the requests data on debug mode', async () => {
      process.env.LOG_LEVEL = 'debug';
      const logger: Logger = defaultLogger();

      jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
      logger.child = () => logger;
      const { restProvider } = await import('../src/index');

      nock('https://pets.com').post('/v1/policies', { test: '1234' }).reply(200, { bender: 'ok' });

      const provider = restProvider(client => {
        return client.post('https://pets.com/v1/policies', {
          json: {
            test: '1234'
          },
          responseType: 'json'
        });
      });
      const ctx = createContext({
        id: '1',
        req: { headers: { 'x-request-id': '1' } },
        res: {},
        log: logger
      });

      await provider()(null, ctx, bautajs);

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            body: '{"test":"1234"}',
            headers: {
              'user-agent': 'got (https://github.com/sindresorhus/got)',
              accept: 'application/json',
              'content-type': 'application/json',
              'content-length': '15',
              'accept-encoding': 'gzip, deflate, br',
              'x-request-id': '1'
            },
            query: {},
            method: 'POST',
            url: 'https://pets.com/v1/policies'
          }
        },
        'outgoing request'
      );
    });

    test('should fallback to log level as number in case the logger expose it like that', async () => {
      const logger: Logger = defaultLogger();
      // 20 level means debug mode
      logger.level = 20;
      jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
      logger.child = () => logger;
      const { restProvider } = await import('../src/index');

      nock('https://pets.com').post('/v1/policies', { test: '1234' }).reply(200, { bender: 'ok' });

      const provider = restProvider(client => {
        return client.post('https://pets.com/v1/policies', {
          json: {
            test: '1234'
          },
          responseType: 'json'
        });
      });
      const ctx = createContext({
        id: '1',
        req: { headers: { 'x-request-id': '1' } },
        res: {},
        log: logger
      });

      await provider()(null, ctx, bautajs);

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            body: '{"test":"1234"}',
            headers: {
              'user-agent': 'got (https://github.com/sindresorhus/got)',
              accept: 'application/json',
              'content-type': 'application/json',
              'content-length': '15',
              'accept-encoding': 'gzip, deflate, br',
              'x-request-id': '1'
            },
            query: {},
            method: 'POST',
            url: 'https://pets.com/v1/policies'
          }
        },
        'outgoing request'
      );
    });

    test('should allow a logger where the level is set as function', async () => {
      const logger: Logger = {
        info: jest.fn(),
        debug: jest.fn(),
        // 20 level means debug mode
        level: () => 20,
        trace: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
        warn: jest.fn(),
        child: () => {
          return logger;
        }
      };
      const { restProvider } = await import('../src/index');

      nock('https://pets.com').post('/v1/policies', { test: '1234' }).reply(200, { bender: 'ok' });

      const provider = restProvider(client => {
        return client.post('https://pets.com/v1/policies', {
          json: {
            test: '1234'
          },
          responseType: 'json'
        });
      });
      const ctx = createContext({
        id: '1',
        req: { headers: { 'x-request-id': '1' } },
        res: {},
        log: logger
      });

      await provider()(null, ctx, bautajs);

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            body: '{"test":"1234"}',
            headers: {
              'user-agent': 'got (https://github.com/sindresorhus/got)',
              accept: 'application/json',
              'content-type': 'application/json',
              'content-length': '15',
              'accept-encoding': 'gzip, deflate, br',
              'x-request-id': '1'
            },
            query: {},
            method: 'POST',
            url: 'https://pets.com/v1/policies'
          }
        },
        'outgoing request'
      );
    });

    test('should log the url port if specified', async () => {
      process.env.LOG_LEVEL = 'debug';
      const logger: Logger = defaultLogger();

      jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
      logger.child = () => logger;
      const { restProvider } = await import('../src/index');

      nock('https://pets.com:3000')
        .post('/v1/policies', { test: '1234' })
        .reply(200, { bender: 'ok' });

      const provider = restProvider(client => {
        return client.post('https://pets.com:3000/v1/policies', {
          json: {
            test: '1234'
          },
          responseType: 'json'
        });
      });
      const ctx = createContext({
        id: '1',
        req: { headers: { 'x-request-id': '1' } },
        res: {},
        log: logger
      });

      await provider()(null, ctx, bautajs);

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            body: '{"test":"1234"}',
            headers: {
              'user-agent': 'got (https://github.com/sindresorhus/got)',
              accept: 'application/json',
              'content-type': 'application/json',
              'content-length': '15',
              'accept-encoding': 'gzip, deflate, br',
              'x-request-id': '1'
            },
            query: {},
            method: 'POST',
            url: 'https://pets.com:3000/v1/policies'
          }
        },
        'outgoing request'
      );
    });

    test('should not log headers and body if the log level is set to info', async () => {
      process.env.LOG_LEVEL = 'info';
      const logger: Logger = defaultLogger();

      jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
      jest.spyOn(logger, 'info').mockImplementation(() => undefined);
      logger.child = () => logger;
      const { restProvider } = await import('../src/index');

      nock('https://pets.com')
        .post('/v1/policies', {
          test: '1234'
        })
        .reply(200, { bender: 'ok' });

      const provider = restProvider(client => {
        return client.post('https://pets.com/v1/policies', {
          json: {
            test: '1234'
          },
          responseType: 'json'
        });
      });
      const ctx = createContext({ req: { headers: { 'x-request-id': 1 } }, res: {}, log: logger });

      await provider()(null, ctx, bautajs);

      expect(logger.debug).toHaveBeenCalledTimes(0);

      expect(logger.info).toHaveBeenCalledWith(
        {
          datasourceReq: {
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          }
        },
        'outgoing request'
      );
      expect(logger.info).toHaveBeenCalledWith(
        {
          datasourceReq: {
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          },
          datasourceRes: expect.objectContaining({
            statusCode: 200
          })
        },
        'outgoing request completed'
      );
    });

    test('should log the requests data on debug mode if the request body is not a json', async () => {
      process.env.LOG_LEVEL = 'debug';
      const logger: Logger = defaultLogger();

      jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
      logger.child = () => logger;
      const { restProvider } = await import('../src/index');

      nock('https://pets.com').post('/v1/policies', 'someString').reply(200, { bender: 'ok' });

      const provider = restProvider(client => {
        return client.post('https://pets.com/v1/policies', {
          body: 'someString',
          headers: {
            accept: 'application/json'
          },
          responseType: 'json'
        });
      });
      const ctx = createContext({
        id: '1',
        req: { headers: { 'x-request-id': '1' } },
        res: {},
        log: logger
      });

      await provider()(null, ctx, bautajs);

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            body: 'someString',
            headers: {
              'user-agent': 'got (https://github.com/sindresorhus/got)',
              accept: 'application/json',
              'content-length': '10',
              'accept-encoding': 'gzip, deflate, br',
              'x-request-id': '1'
            },
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          }
        },
        'outgoing request'
      );

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          },
          datasourceRes: expect.objectContaining({
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ bender: 'ok' })
          })
        },
        'outgoing request completed'
      );
    });

    test('should log always the body and headers if ignoreLogLevel is set to true', async () => {
      process.env.LOG_LEVEL = 'info';
      const logger: Logger = defaultLogger();

      jest.spyOn(logger, 'info').mockImplementation(() => undefined);
      logger.child = () => logger;
      const { restProvider } = await import('../src/index');

      nock('https://pets.com').post('/v1/policies', 'someString').reply(200, { bender: 'ok' });

      const provider = restProvider(
        client => {
          return client.post('https://pets.com/v1/policies', {
            body: 'someString',
            headers: {
              accept: 'application/json'
            },
            responseType: 'json'
          });
        },
        { ignoreLogLevel: true }
      );
      const ctx = createContext({
        id: '1',
        req: { headers: { 'x-request-id': '1' } },
        res: {},
        log: logger
      });

      await provider()(null, ctx, bautajs);

      expect(logger.info).toHaveBeenCalledWith(
        {
          datasourceReq: {
            body: 'someString',
            headers: {
              'user-agent': 'got (https://github.com/sindresorhus/got)',
              accept: 'application/json',
              'content-length': '10',
              'accept-encoding': 'gzip, deflate, br',
              'x-request-id': '1'
            },
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          }
        },
        'outgoing request'
      );

      expect(logger.info).toHaveBeenCalledWith(
        {
          datasourceReq: {
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          },
          datasourceRes: expect.objectContaining({
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ bender: 'ok' })
          })
        },
        'outgoing request completed'
      );
    });

    test('should not print the response body if the size in bytes exceed the maxBodyLogSize', async () => {
      process.env.LOG_LEVEL = 'debug';
      const logger: Logger = defaultLogger();

      jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
      logger.child = () => logger;
      const { restProvider } = await import('../src/index');

      nock('https://pets.com')
        .post('/v1/policies', 'someString')
        .reply(200, { bender: 'ok', bender2: 'ok2', foo: 'boo' });

      const provider = restProvider(
        client => {
          return client.post('https://pets.com/v1/policies', {
            body: 'someString',
            headers: {
              accept: 'application/json'
            },
            responseType: 'json'
          });
        },
        { maxBodyLogSize: 15 }
      );
      const ctx = createContext({
        id: '1',
        req: { headers: { 'x-request-id': '1' } },
        res: {},
        log: logger
      });

      await provider()(null, ctx, bautajs);

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            body: 'someString',
            headers: {
              'user-agent': 'got (https://github.com/sindresorhus/got)',
              accept: 'application/json',
              'content-length': '10',
              'accept-encoding': 'gzip, deflate, br',
              'x-request-id': '1'
            },
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          }
        },
        'outgoing request'
      );

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          },
          datasourceRes: expect.objectContaining({
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: {
              reason: 'Body exceeds the limit of 15 bytes.',
              type: 'JSON',
              byteLength: 43
            }
          })
        },
        'outgoing request completed'
      );
    });

    test('maxBodyLogSize should be configurable on the bautajs instance', async () => {
      process.env.LOG_LEVEL = 'debug';
      const customBautajsInstance = new BautaJS({
        staticConfig: {
          maxBodyLogSize: 15
        }
      });
      const logger: Logger = defaultLogger();

      jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
      logger.child = () => logger;
      const { restProvider } = await import('../src/index');

      nock('https://pets.com')
        .post('/v1/policies', 'someString')
        .reply(200, { bender: 'ok', bender2: 'ok2', foo: 'boo' });

      const provider = restProvider(client => {
        return client.post('https://pets.com/v1/policies', {
          body: 'someString',
          headers: {
            accept: 'application/json'
          },
          responseType: 'json'
        });
      });
      const ctx = createContext({
        id: '1',
        req: { headers: { 'x-request-id': '1' } },
        res: {},
        log: logger
      });

      await provider()(null, ctx, customBautajsInstance);

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            body: 'someString',
            headers: {
              'user-agent': 'got (https://github.com/sindresorhus/got)',
              accept: 'application/json',
              'content-length': '10',
              'accept-encoding': 'gzip, deflate, br',
              'x-request-id': '1'
            },
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          }
        },
        'outgoing request'
      );

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          },
          datasourceRes: expect.objectContaining({
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: {
              reason: 'Body exceeds the limit of 15 bytes.',
              type: 'JSON',
              byteLength: 43
            }
          })
        },
        'outgoing request completed'
      );
    });

    test('maxBodyLogSize should set in the provider has to override the global maxBodyLogSize configuration', async () => {
      process.env.LOG_LEVEL = 'debug';
      const customBautajsInstance = new BautaJS({
        staticConfig: {
          maxBodyLogSize: 90000000
        }
      });
      const logger: Logger = defaultLogger();

      jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
      logger.child = () => logger;
      const { restProvider } = await import('../src/index');

      nock('https://pets.com')
        .post('/v1/policies', 'someString')
        .reply(200, { bender: 'ok', bender2: 'ok2', foo: 'boo' });

      const provider = restProvider(
        client => {
          return client.post('https://pets.com/v1/policies', {
            body: 'someString',
            headers: {
              accept: 'application/json'
            },
            responseType: 'json'
          });
        },
        { maxBodyLogSize: 20 }
      );
      const ctx = createContext({
        id: '1',
        req: { headers: { 'x-request-id': '1' } },
        res: {},
        log: logger
      });

      await provider()(null, ctx, customBautajsInstance);

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            body: 'someString',
            headers: {
              'user-agent': 'got (https://github.com/sindresorhus/got)',
              accept: 'application/json',
              'content-length': '10',
              'accept-encoding': 'gzip, deflate, br',
              'x-request-id': '1'
            },
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          }
        },
        'outgoing request'
      );

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          },
          datasourceRes: expect.objectContaining({
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: {
              reason: 'Body exceeds the limit of 20 bytes.',
              type: 'JSON',
              byteLength: 43
            }
          })
        },
        'outgoing request completed'
      );
    });

    test('should not log the body in a buffer format in case that is a buffer', async () => {
      process.env.LOG_LEVEL = 'debug';
      const logger: Logger = defaultLogger();

      jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
      logger.child = () => logger;
      const { restProvider } = await import('../src/index');

      nock('https://pets.com').post('/v1/policies').reply(200, { bender: 'ok' });

      const provider = restProvider(client => {
        return client.post('https://pets.com/v1/policies', {
          body: Buffer.from('string'),
          headers: {
            accept: 'application/json'
          },
          responseType: 'json'
        });
      });
      const ctx = createContext({
        id: '1',
        req: { headers: { 'x-request-id': '1' } },
        res: {},
        log: logger
      });

      await provider()(null, ctx, bautajs);

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            body: {
              file: {
                type: 'Buffer',
                byteLength: 6
              }
            },
            headers: {
              'user-agent': 'got (https://github.com/sindresorhus/got)',
              accept: 'application/json',
              'content-length': '6',
              'accept-encoding': 'gzip, deflate, br',
              'x-request-id': '1'
            },
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          }
        },
        'outgoing request'
      );

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          },
          datasourceRes: expect.objectContaining({
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ bender: 'ok' })
          })
        },
        'outgoing request completed'
      );
    });
    test('should not log the body if is an stream', async () => {
      process.env.LOG_LEVEL = 'debug';
      const logger: Logger = defaultLogger();

      jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
      logger.child = () => logger;
      const { restProvider } = await import('../src/index');

      nock('https://pets.com').post('/v1/policies').reply(200, { bender: 'ok' });

      const provider = restProvider(client => {
        return client.post('https://pets.com/v1/policies', {
          body: Readable.from(['input string']),
          responseType: 'json'
        });
      });
      const ctx = createContext({
        id: '1',
        req: { headers: { 'x-request-id': '1' } },
        res: {},
        log: logger
      });

      await provider()(null, ctx, bautajs);

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            body: {
              file: {
                type: 'Stream'
              }
            },
            headers: {
              accept: 'application/json',
              'accept-encoding': 'gzip, deflate, br',
              'user-agent': 'got (https://github.com/sindresorhus/got)',
              'x-request-id': '1'
            },
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          }
        },
        'outgoing request'
      );

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          },
          datasourceRes: expect.objectContaining({
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ bender: 'ok' })
          })
        },
        'outgoing request completed'
      );
    });

    test('should override the logger hooks for response and request', async () => {
      process.env.LOG_LEVEL = 'debug';
      const logger: Logger = defaultLogger();

      jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
      logger.child = () => logger;
      const { restProvider } = await import('../src/index');

      const logResponseHook = () => {
        return (response: any) => {
          logger.debug('logResponseHook');

          return response;
        };
      };
      const logRequestHook = () => {
        return () => {
          logger.debug('logRequestHook');
        };
      };

      nock('https://pets.com').post('/v1/policies', { test: '1234' }).reply(200, { bender: 'ok' });

      const provider = restProvider(
        client => {
          return client.post('https://pets.com/v1/policies', {
            json: {
              test: '1234'
            },
            responseType: 'json'
          });
        },
        {
          logHooks: {
            logRequestHook,
            logResponseHook
          }
        }
      );
      const ctx = createContext({
        id: '1',
        req: { headers: { 'x-request-id': '1' } },
        res: {},
        log: logger
      });

      await provider()(null, ctx, bautajs);

      expect(logger.debug).toHaveBeenCalledWith('logRequestHook');
      expect(logger.debug).toHaveBeenCalledWith('logResponseHook');
    });

    test('should override the logger hooks for errors', async () => {
      process.env.LOG_LEVEL = 'debug';
      const logger: Logger = defaultLogger();

      jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
      logger.child = () => logger;
      const { restProvider } = await import('../src/index');

      const logErrorsHook = () => {
        return (error: RequestError) => {
          logger.debug('logErrorHook');

          throw error;
        };
      };

      nock('https://pets.com').post('/v1/policies', { test: '1234' }).reply(404, { bender: 'ok' });

      const provider = restProvider(
        client => {
          return client.post('https://pets.com/v1/policies', {
            json: {
              test: '1234'
            },
            responseType: 'json'
          });
        },
        {
          logHooks: {
            logErrorsHook
          }
        }
      );
      const ctx = createContext({
        id: '1',
        req: { headers: { 'x-request-id': '1' } },
        res: {},
        log: logger
      });

      await expect(provider()(null, ctx, bautajs)).rejects.toStrictEqual(
        expect.objectContaining({ message: 'Response code 404 (Not Found)' })
      );

      expect(logger.debug).toHaveBeenNthCalledWith(2, 'logErrorHook');
    });

    test('should not print the request body if the size in bytes exceed the maxBodyLogSize', async () => {
      process.env.LOG_LEVEL = 'debug';
      const logger: Logger = defaultLogger();

      jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
      logger.child = () => logger;
      const { restProvider } = await import('../src/index');

      nock('https://pets.com')
        .post('/v1/policies', "{ bender: 'ok', bender2: 'ok2', foo: 'boo' }")
        .reply(200, { bender: 'ok' });

      const provider = restProvider(
        client => {
          return client.post('https://pets.com/v1/policies', {
            body: "{ bender: 'ok', bender2: 'ok2', foo: 'boo' }",
            headers: {
              accept: 'application/json'
            },
            responseType: 'json'
          });
        },
        { maxBodyLogSize: 15 }
      );
      const ctx = createContext({
        id: '1',
        req: { headers: { 'x-request-id': '1' } },
        res: {},
        log: logger
      });

      await provider()(null, ctx, bautajs);

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            body: {
              reason: 'Body exceeds the limit of 15 bytes.',
              type: 'JSON',
              byteLength: 44
            },
            headers: {
              'user-agent': 'got (https://github.com/sindresorhus/got)',
              accept: 'application/json',
              'content-length': '44',
              'accept-encoding': 'gzip, deflate, br',
              'x-request-id': '1'
            },
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          }
        },
        'outgoing request'
      );

      expect(logger.debug).toHaveBeenCalledWith(
        {
          datasourceReq: {
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          },
          datasourceRes: expect.objectContaining({
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: '{"bender":"ok"}'
          })
        },
        'outgoing request completed'
      );
    });

    test('should not print the error body if the size in bytes exceed the maxBodyLogSize', async () => {
      process.env.LOG_LEVEL = 'debug';
      const logger: Logger = defaultLogger();

      jest.spyOn(logger, 'error').mockImplementation(() => undefined);
      logger.child = () => logger;
      const { restProvider } = await import('../src/index');

      nock('https://pets.com')
        .post('/v1/policies', "{ bender: 'ok', bender2: 'ok2', foo: 'boo' }")
        .reply(400, { message: 'error', message1: 'error1', message2: 'error2' });

      const provider = restProvider(
        client => {
          return client.post('https://pets.com/v1/policies', {
            body: "{ bender: 'ok', bender2: 'ok2', foo: 'boo' }",
            headers: {
              accept: 'application/json'
            },
            responseType: 'json'
          });
        },
        { maxBodyLogSize: 10 }
      );
      const ctx = createContext({
        id: '1',
        req: { headers: { 'x-request-id': '1' } },
        res: {},
        log: logger
      });

      await expect(provider()(null, ctx, bautajs)).rejects.toThrow(
        expect.objectContaining({ statusCode: 400 })
      );

      expect(logger.error).toHaveBeenCalledWith(
        {
          datasourceReq: {
            method: 'POST',
            query: {},
            url: 'https://pets.com/v1/policies'
          },
          datasourceErr: expect.objectContaining({
            message: 'Response code 400 (Bad Request)',
            headers: { 'content-type': 'application/json' },
            body: {
              reason: 'Body exceeds the limit of 10 bytes.',
              type: 'JSON',
              byteLength: 59
            }
          })
        },
        'outgoing request failed'
      );
    });
  });

  describe('query params', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    test('should sent the query params to the provider', async () => {
      const { restProvider } = await import('../src/index');

      const Id = '123';
      nock('https://google.com')
        .get(`/${Id}`)
        .query(q => q.testParam1 === '25')
        .reply(200, [{ id: 3, name: 'pet3' }]);

      const provider = restProvider((client, _, ctx) => {
        return client.get(`https://google.com/${ctx.data.myId}`, {
          responseType: 'json',
          searchParams: { testParam1: '25' }
        });
      });

      const pipeline = pipe((_, ctx) => {
        ctx.data.myId = Id;
      }, provider());

      const response = await pipeline(
        null,
        createContext({
          req: { id: 1 },
          res: { statusCode: 200 }
        }),
        bautajs
      );

      expect(response).toStrictEqual([{ id: 3, name: 'pet3' }]);
    });

    describe('logs when there is an error', () => {
      beforeEach(() => {
        jest.resetModules();
      });
      test('should log a network error', async () => {
        process.env.LOG_LEVEL = 'debug';
        const logger: Logger = defaultLogger();

        jest.spyOn(logger, 'error').mockImplementation(() => undefined);
        logger.child = () => {
          return logger;
        };
        const { restProvider } = await import('../src/index');

        nock('https://pets.com/v1').get('/policies').replyWithError('something awful happened');

        const provider = restProvider(client => {
          return client.get('https://pets.com/v1/policies', {
            responseType: 'json'
          });
        });

        const ctx = createContext({
          req: { headers: { 'x-request-id': 1 } },
          res: {},
          log: logger
        });

        try {
          await provider()(null, ctx, bautajs);
        } catch (e) {
          // Empty
        }

        expect(logger.error).toHaveBeenCalledWith(
          {
            datasourceReq: {
              method: 'GET',
              query: {},
              url: 'https://pets.com/v1/policies'
            },
            datasourceErr: {
              code: 'ERR_GOT_REQUEST_ERROR',
              name: 'RequestError',
              message: 'something awful happened'
            }
          },
          'outgoing request failed'
        );
      });

      test('should log an error if the response body could not be parsed', async () => {
        process.env.LOG_LEVEL = 'debug';
        const logger: Logger = defaultLogger();

        logger.child = () => logger;
        jest.spyOn(logger, 'error').mockImplementation(() => undefined);

        const { restProvider } = await import('../src/index');

        nock('https://pets.com/v1')
          .get('/policies')
          .reply(200, 'this is not a json and this will generate a parser error');

        const provider = restProvider(client => {
          return client.get('https://pets.com/v1/policies', {
            responseType: 'json'
          });
        });

        const ctx = createContext({
          req: { headers: { 'x-request-id': 1 } },
          res: {},
          log: logger
        });

        try {
          await provider()(null, ctx, bautajs);
        } catch (e) {
          // Empty
        }

        expect(logger.error).toHaveBeenCalledWith(
          {
            datasourceErr: expect.objectContaining({
              headers: {},
              code: 'ERR_BODY_PARSE_FAILURE',
              body: 'this is not a json and this will generate a parser error',
              statusCode: 200,
              name: 'ParseError'
            }),
            datasourceReq: {
              method: 'GET',
              query: {},
              url: 'https://pets.com/v1/policies'
            }
          },
          'outgoing request failed'
        );
      });

      test('should log a crash error on parsing', async () => {
        process.env.LOG_LEVEL = 'debug';
        const logger: Logger = defaultLogger();

        // create context will create a logger child
        logger.child = () => logger;
        jest.spyOn(logger, 'error').mockImplementation(() => undefined);
        jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
        const { restProvider } = await import('../src/index');

        nock('https://pets.com/v1').get('/policies').reply(200, 'we force with this a parserError');

        const provider = restProvider(client => {
          return client.get('https://pets.com/v1/policies', {
            responseType: 'json'
          });
        });

        const ctx = createContext({
          id: '1',
          req: { headers: { 'x-request-id': 1 } },
          res: {},
          log: logger
        });

        async function providerThrowsAnError() {
          return provider()(null, ctx, bautajs);
        }

        await expect(providerThrowsAnError()).rejects.toThrowError();

        expect(logger.error).toHaveBeenCalledTimes(1); // We check error logging in another test

        expect(logger.debug).toHaveBeenCalledTimes(1); // If there was not an error, info is called twice
        expect(logger.debug).toHaveBeenCalledWith(
          {
            datasourceReq: {
              headers: {
                accept: 'application/json',
                'accept-encoding': 'gzip, deflate, br',
                'user-agent': 'got (https://github.com/sindresorhus/got)',
                'x-request-id': '1'
              },
              method: 'GET',
              query: {},
              url: 'https://pets.com/v1/policies'
            }
          },
          'outgoing request'
        );
        expect(logger.error).toHaveBeenCalledWith(
          {
            datasourceErr: expect.objectContaining({
              code: 'ERR_BODY_PARSE_FAILURE',
              name: 'ParseError',
              body: 'we force with this a parserError',
              headers: {},
              statusCode: 200
            }),
            datasourceReq: {
              method: 'GET',
              query: {},
              url: 'https://pets.com/v1/policies'
            }
          },
          'outgoing request failed'
        );
      });

      test('should generate a meaningful error if there is an issue', async () => {
        const { restProvider } = await import('../src/index');

        nock('https://pets.com/v1').get('/policies').reply(200, '<html><div></div></html>', {
          'content-type': 'text/html'
        });

        const provider = restProvider(client => {
          return client.get('https://pets.com/v1/policies', {
            responseType: 'json'
          });
        });

        const ctx = createContext({
          req: { headers: { 'x-request-id': 1 } },
          res: {},
          log: bautajs.logger
        });

        async function providerThrowsAnError() {
          return provider()(null, ctx, bautajs);
        }

        await expect(providerThrowsAnError()).rejects.toThrowError();
      });
    });
  });
});
