/* eslint-disable global-require */
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
import { createContext, BautaJS, defaultLogger } from '@bautajs/core';
import { CancelableRequest, ResponseStream } from 'got';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';

describe('provider rest', () => {
  let bautajs: BautaJS;

  beforeEach(async () => {
    bautajs = new BautaJS(testApiDefinitionsJson as any[]);
    await bautajs.bootstrap();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('got extends defaults', () => {
    test('should allow do a requests with GOT options and the built in agent', async () => {
      const { restProvider } = require('../index');

      const Id = '123';
      nock('https://google.com')
        .get(`/${Id}`)
        .reply(200, [{ id: 3, name: 'pet3' }]);

      const provider = restProvider((client, _, ctx) => {
        return client.get(`https://google.com/${ctx.data.myId}`, { responseType: 'json' });
      });

      bautajs.operations.v1.operation1.validateResponse(false).setup(p => {
        p.pipe((_, ctx) => {
          ctx.data.myId = Id;
        }, provider());
      });

      const response = await bautajs.operations.v1.operation1.run({
        req: { id: 1 },
        res: { statusCode: 200 }
      });

      expect(response).toStrictEqual([{ id: 3, name: 'pet3' }]);
    });

    test('should add the response status code if an http error ocurres', async () => {
      const { restProvider } = require('../index');

      const Id = '123';
      nock('https://google.com')
        .get(`/${Id}`)
        .reply(404, { message: 'not found' });

      const provider = restProvider((client, _, ctx) => {
        return client.get(`https://google.com/${ctx.data.myId}`, { responseType: 'json' });
      });

      bautajs.operations.v1.operation1.validateResponse(false).setup(p => {
        p.pipe((_, ctx) => {
          ctx.data.myId = Id;
        }, provider());
      });

      await expect(
        bautajs.operations.v1.operation1.run({
          req: { id: 1 },
          res: { statusCode: 200 }
        })
      ).rejects.toThrow(expect.objectContaining({ statusCode: 404, message: 'not found' }));
    });

    test('should add the response status code if an http error ocurres and message should be case insensitive', async () => {
      const { restProvider } = require('../index');

      const Id = '123';
      nock('https://google.com')
        .get(`/${Id}`)
        .reply(404, { Message: 'not found' });

      const provider = restProvider((client, _, ctx) => {
        return client.get(`https://google.com/${ctx.data.myId}`, { responseType: 'json' });
      });

      bautajs.operations.v1.operation1.validateResponse(false).setup(p => {
        p.pipe((_, ctx) => {
          ctx.data.myId = Id;
        }, provider());
      });

      await expect(
        bautajs.operations.v1.operation1.run({
          req: { id: 1 },
          res: { statusCode: 200 }
        })
      ).rejects.toThrow(expect.objectContaining({ statusCode: 404, message: 'not found' }));
    });

    test('should allow do a requests with GOT options and the built in agent with de default set up', async () => {
      const { restProvider } = require('../index');
      const Id = '123';
      nock('https://google.com')
        .get(`/${Id}`)
        .reply(200, [{ id: 3, name: 'pet3' }]);

      const provider = restProvider((client, _, ctx) => {
        return client.get(`https://google.com/${ctx.data.myId}`);
      });

      bautajs.operations.v1.operation1.validateResponse(false).setup(p => {
        p.pipe((_, ctx) => {
          ctx.data.myId = Id;
        }, provider());
      });

      const response = await bautajs.operations.v1.operation1.run({
        req: { id: 1 },
        res: { statusCode: 200 }
      });

      expect(response).toStrictEqual([{ id: 3, name: 'pet3' }]);
    });
  });

  describe('request cancelation', () => {
    test('should cancel the request if the a cancel is executed', async () => {
      const { restProvider } = require('../index');
      nock('http://pets.com')
        .get('/v1/policies')
        .reply(200, {});

      const myContext = createContext({ req: {}, res: {} }, bautajs.logger);
      const provider = restProvider(client => {
        return client.get('http://pets.com/v1/policies', { responseType: 'json' });
      });
      const request1 = provider()(null, myContext, bautajs);

      myContext.token.cancel();

      await expect(request1).rejects.toThrow(
        expect.objectContaining({ message: 'Promise was canceled' })
      );
      expect((request1 as CancelableRequest<any>).isCanceled).toStrictEqual(true);
    });

    test('should cancel the request if the a cancel is executed and the request is an stream', async () => {
      const { restProvider } = require('../index');
      nock('http://pets.com')
        .get('/v1/policies')
        .reply(200, {});

      const myContext = createContext({ req: {}, res: {} }, bautajs.logger);
      const provider = restProvider(client => {
        return client.stream('http://pets.com/v1/policies', { responseType: 'json' });
      });
      const request1 = provider()(null, myContext, bautajs);

      myContext.token.cancel();
      await request1;
      expect((request1 as ResponseStream<any>).destroyed).toStrictEqual(true);
    });
  });

  describe('logs on happy path', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    test('should log the requests data on debug mode', async () => {
      const logger = defaultLogger();
      jest.spyOn(logger, 'debug').mockImplementation();
      logger.child = () => {
        return logger;
      };
      process.env.LOG_LEVEL = 'debug';
      const { restProvider } = require('../index');

      nock('https://pets.com')
        .post('/v1/policies', { test: '1234' })
        .reply(200, { bender: 'ok' });

      const provider = restProvider(client => {
        return client.post('https://pets.com/v1/policies', {
          json: {
            test: '1234'
          },
          responseType: 'json'
        });
      });
      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} }, logger);

      await provider()(null, ctx, bautajs);

      expect(logger.debug).toHaveBeenCalledWith(
        {
          requestData: {
            body: '{"test":"1234"}',
            headers: '{"user-agent":"got (https://github.com/sindresorhus/got)","x-request-id":1}',
            method: 'POST',
            url: 'https://pets.com/v1/policies'
          }
        },
        'request-logger: Request data'
      );

      expect(logger.debug).toHaveBeenCalledWith(
        {
          providerUrl: '[POST] https://pets.com/v1/policies',
          response: {
            body: '{"bender":"ok"}',
            headers: '{"content-type":"application/json"}',
            statusCode: 200
          }
        },
        'response-logger: Response for [POST] https://pets.com/v1/policies'
      );
    });

    test('should log only the requests method and url and response time if log level is info', async () => {
      const logger = defaultLogger();
      jest.spyOn(logger, 'debug').mockImplementation();
      jest.spyOn(logger, 'info').mockImplementation();
      logger.child = () => {
        return logger;
      };
      process.env.LOG_LEVEL = 'info';
      const { restProvider } = require('../index');

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
      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} }, logger);

      await provider()(null, ctx, bautajs);

      expect(logger.debug).toHaveBeenCalledTimes(0);

      expect(logger.info).toHaveBeenCalledWith(
        'request-logger: Request to [POST] https://pets.com/v1/policies'
      );

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /response-logger: The request to https:\/\/pets\.com\/v1\/policies took: (\d*) ms/
        )
      );
    });

    test('should log the requests data on debug mode if the request body is not a json', async () => {
      const logger = defaultLogger();
      jest.spyOn(logger, 'debug').mockImplementation();
      logger.child = () => {
        return logger;
      };
      process.env.LOG_LEVEL = 'debug';
      const { restProvider } = require('../index');

      nock('https://pets.com')
        .post('/v1/policies', 'someString')
        .reply(200, { bender: 'ok' });

      const provider = restProvider(client => {
        return client.post('https://pets.com/v1/policies', {
          body: 'someString',
          headers: {
            accept: 'application/json'
          },
          responseType: 'json'
        });
      });
      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} }, logger);

      await provider()(null, ctx, bautajs);

      expect(logger.debug).toHaveBeenCalledWith(
        {
          requestData: {
            body: 'someString',
            headers:
              '{"user-agent":"got (https://github.com/sindresorhus/got)","accept":"application/json","x-request-id":1}',
            method: 'POST',
            url: 'https://pets.com/v1/policies'
          }
        },
        'request-logger: Request data'
      );

      expect(logger.debug).toHaveBeenCalledWith(
        {
          providerUrl: '[POST] https://pets.com/v1/policies',
          response: {
            statusCode: 200,
            headers: JSON.stringify({ 'content-type': 'application/json' }),
            body: JSON.stringify({ bender: 'ok' })
          }
        },
        'response-logger: Response for [POST] https://pets.com/v1/policies'
      );
    });
  });

  describe('logs when there is an error', () => {
    beforeEach(() => {
      jest.resetModules();
    });
    test('should log a network error', async () => {
      const logger = defaultLogger();
      jest.spyOn(logger, 'error').mockImplementation();
      logger.child = () => {
        return logger;
      };
      process.env.LOG_LEVEL = 'debug';
      const { restProvider } = require('../index');

      nock('https://pets.com/v1')
        .get('/policies')
        .replyWithError('something awful happened');

      const provider = restProvider(client => {
        return client.get('https://pets.com/v1/policies', {
          responseType: 'json'
        });
      });

      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} }, logger);

      try {
        await provider()(null, ctx, bautajs);
      } catch (e) {
        // Empty
      }

      expect(logger.error).toHaveBeenCalledWith(
        {
          error: {
            code: undefined,
            name: 'RequestError',
            message: 'something awful happened'
          },
          providerUrl: '[GET] https://pets.com/v1/policies'
        },
        'response-logger: Error for [GET] https://pets.com/v1/policies'
      );
    });

    test('should log an error if the response body could not be parsed', async () => {
      const logger = defaultLogger();
      logger.child = () => logger;
      jest.spyOn(logger, 'error').mockImplementation();

      process.env.LOG_LEVEL = 'debug';
      const { restProvider } = require('../index');

      nock('https://pets.com/v1')
        .get('/policies')
        .reply(200, 'this is not a json and this will generate a parser error');

      const provider = restProvider(client => {
        return client.get('https://pets.com/v1/policies', {
          responseType: 'json'
        });
      });

      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} }, logger);

      try {
        await provider()(null, ctx, bautajs);
      } catch (e) {
        // Empty
      }

      expect(logger.error).toHaveBeenCalledWith(
        {
          error: {
            code: undefined,
            body: 'this is not a json and this will generate a parser error',
            statusCode: 200,
            message: 'Unexpected token h in JSON at position 1 in "https://pets.com/v1/policies"',
            name: 'ParseError'
          },
          providerUrl: '[GET] https://pets.com/v1/policies'
        },
        'response-logger: Error for [GET] https://pets.com/v1/policies'
      );
    });

    test('should not log the response time when there is an error', async () => {
      const logger = defaultLogger();
      // create context will create a logger child
      logger.child = () => logger;
      jest.spyOn(logger, 'error').mockImplementation();
      jest.spyOn(logger, 'info').mockImplementation();
      process.env.LOG_LEVEL = 'info';
      const { restProvider } = require('../index');

      nock('https://pets.com/v1')
        .get('/policies')
        .reply(200, 'we force with this a parserError');

      const provider = restProvider(client => {
        return client.get('https://pets.com/v1/policies', {
          responseType: 'json'
        });
      });

      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} }, logger);

      async function providerThrowsAnError() {
        return provider()(null, ctx, bautajs);
      }

      await expect(providerThrowsAnError()).rejects.toThrow(
        new Error('Unexpected token w in JSON at position 0 in "https://pets.com/v1/policies"')
      );

      expect(logger.error).toHaveBeenCalledTimes(1); // We check error logging in another test

      expect(logger.info).toHaveBeenCalledTimes(1); // If there was not an error, info is called twice
      expect(logger.info).toHaveBeenCalledWith(
        'request-logger: Request to [GET] https://pets.com/v1/policies'
      );
    });

    test('should generate a meaningful error if there is an issue', async () => {
      const { restProvider } = require('../index');

      nock('https://pets.com/v1')
        .get('/policies')
        .reply(200, '<html><div></div></html>', {
          'content-type': 'text/html'
        });

      const provider = restProvider(client => {
        return client.get('https://pets.com/v1/policies', {
          responseType: 'json'
        });
      });

      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} }, bautajs.logger);

      async function providerThrowsAnError() {
        return provider()(null, ctx, bautajs);
      }

      await expect(providerThrowsAnError()).rejects.toThrow(
        new Error('Unexpected token < in JSON at position 0 in "https://pets.com/v1/policies"')
      );
    });
  });
});
