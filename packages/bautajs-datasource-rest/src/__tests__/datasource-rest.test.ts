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
import { createContext, BautaJS, Document } from '@bautajs/core';
import { CancelableRequest, ResponseStream } from 'got';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';

describe('provider rest', () => {
  let bautajs: BautaJS;

  beforeEach(async () => {
    bautajs = new BautaJS(testApiDefinitionsJson as Document[]);
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
      const spyOnDebug = jest.spyOn(bautajs.logger, 'debug');
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
      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} }, bautajs.logger);

      await provider()(null, ctx, bautajs);

      expect(spyOnDebug).toHaveBeenNthCalledWith(
        1,
        'id:1,url:undefined',
        'request-logger[1]: Request data: ',
        {
          body: '{"test":"1234"}',
          headers: '{"user-agent":"got (https://github.com/sindresorhus/got)","x-request-id":1}',
          method: 'POST',
          url: 'https://pets.com/v1/policies'
        }
      );
      expect(spyOnDebug).toHaveBeenNthCalledWith(
        2,
        'id:1,url:undefined',
        'response-logger[1]: Response for [POST] https://pets.com/v1/policies: ',
        {
          statusCode: 200,
          headers: JSON.stringify({ 'content-type': 'application/json' }),
          body: JSON.stringify({ bender: 'ok' })
        }
      );
    });

    test(`should not log the request id if it's not defined`, async () => {
      const spyOnDebug = jest.spyOn(bautajs.logger, 'debug');
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
      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} }, bautajs.logger);
      // This is a limit case to test the datasource behaviour if the request should have no id. Note that in a real
      // case, bauta core always generates a request id and assigns it to the context. It is for this reason that in the next
      // expectations, the second parameter has no request id, while the first, based on the namespace of the context, do have it.
      ctx.id = undefined;
      await provider()(null, ctx, bautajs);

      expect(spyOnDebug).toHaveBeenNthCalledWith(
        1,
        'id:1,url:undefined',
        'request-logger[No req id]: Request data: ',
        {
          body: '{"test":"1234"}',
          headers: '{"user-agent":"got (https://github.com/sindresorhus/got)"}',
          method: 'POST',
          url: 'https://pets.com/v1/policies'
        }
      );
      expect(spyOnDebug).toHaveBeenNthCalledWith(
        2,
        'id:1,url:undefined',
        'response-logger[No req id]: Response for [POST] https://pets.com/v1/policies: ',
        {
          statusCode: 200,
          headers: JSON.stringify({ 'content-type': 'application/json' }),
          body: JSON.stringify({ bender: 'ok' })
        }
      );
    });

    test('should log only the requests method and url and response time if log level is info', async () => {
      const spyOnDebug = jest.spyOn(bautajs.logger, 'debug');
      const spyOnInfo = jest.spyOn(bautajs.logger, 'info');
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
      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} }, bautajs.logger);

      await provider()(null, ctx, bautajs);

      expect(spyOnDebug).toHaveBeenCalledTimes(0);

      expect(spyOnInfo).toHaveBeenNthCalledWith(
        1,
        'id:1,url:undefined',
        'request-logger[1]: Request to [POST] https://pets.com/v1/policies'
      );

      expect(spyOnInfo).toHaveBeenNthCalledWith(
        2,
        'id:1,url:undefined',
        expect.stringMatching(
          /response-logger\[1\]: The request to https:\/\/pets\.com\/v1\/policies took: (\d*) ms/
        )
      );
    });

    test('should log the requests data on debug mode if the request body is not a json', async () => {
      const spyOnDebug = jest.spyOn(bautajs.logger, 'debug');
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
      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} }, bautajs.logger);

      await provider()(null, ctx, bautajs);

      expect(spyOnDebug).toHaveBeenNthCalledWith(
        1,
        'id:1,url:undefined',
        'request-logger[1]: Request data: ',
        {
          body: 'someString',
          headers:
            '{"user-agent":"got (https://github.com/sindresorhus/got)","accept":"application/json","x-request-id":1}',
          method: 'POST',
          url: 'https://pets.com/v1/policies'
        }
      );

      expect(spyOnDebug).toHaveBeenNthCalledWith(
        2,
        'id:1,url:undefined',
        'response-logger[1]: Response for [POST] https://pets.com/v1/policies: ',
        {
          statusCode: 200,
          headers: JSON.stringify({ 'content-type': 'application/json' }),
          body: JSON.stringify({ bender: 'ok' })
        }
      );
    });
  });

  describe('logs when there is an error', () => {
    beforeEach(() => {
      jest.resetModules();
    });
    test('should log a network error', async () => {
      const spyOnError = jest.spyOn(bautajs.logger, 'error');
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

      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} }, bautajs.logger);

      try {
        await provider()(null, ctx, bautajs);
      } catch (e) {
        // Empty
      }

      expect(spyOnError).toHaveBeenNthCalledWith(
        1,
        'id:1,url:undefined',
        'response-logger[1]: Error for [GET] https://pets.com/v1/policies:',
        {
          code: undefined,
          name: 'RequestError',
          message: 'something awful happened'
        }
      );
    });

    test('should not log the id if no id is provided in an error', async () => {
      const spyOnError = jest.spyOn(bautajs.logger, 'error');
      const spyOnDebug = jest.spyOn(bautajs.logger, 'debug');
      process.env.LOG_LEVEL = 'error';
      const { restProvider } = require('../index');

      nock('https://pets.com/v1')
        .get('/policies')
        .replyWithError('something awful happened');

      const provider = restProvider(client => {
        return client.get('https://pets.com/v1/policies', {
          responseType: 'json'
        });
      });

      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} }, bautajs.logger);

      ctx.id = undefined;

      try {
        await provider()(null, ctx, bautajs);
      } catch (e) {
        // Empty
      }

      expect(spyOnDebug).toHaveBeenCalledTimes(0);

      expect(spyOnError).toHaveBeenNthCalledWith(
        1,
        'id:1,url:undefined',
        'response-logger[No req id]: Error for [GET] https://pets.com/v1/policies:',
        {
          code: undefined,
          name: 'RequestError',
          message: 'something awful happened'
        }
      );
    });

    test('should log an error if the response body could not be parsed', async () => {
      const spyOnError = jest.spyOn(bautajs.logger, 'error');

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

      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} }, bautajs.logger);

      try {
        await provider()(null, ctx, bautajs);
      } catch (e) {
        // Empty
      }

      expect(spyOnError).toHaveBeenNthCalledWith(
        1,
        'id:1,url:undefined',
        'response-logger[1]: Error for [GET] https://pets.com/v1/policies:',
        {
          code: undefined,
          body: 'this is not a json and this will generate a parser error',
          statusCode: 200,
          message: 'Unexpected token h in JSON at position 1 in "https://pets.com/v1/policies"',
          name: 'ParseError'
        }
      );
    });

    test('should not log the response time when there is an error', async () => {
      const spyOnError = jest.spyOn(bautajs.logger, 'error');
      const spyOnInfo = jest.spyOn(bautajs.logger, 'info');
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

      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} }, bautajs.logger);

      async function providerThrowsAnError() {
        return provider()(null, ctx, bautajs);
      }

      await expect(providerThrowsAnError()).rejects.toThrow(
        new Error('Unexpected token w in JSON at position 0 in "https://pets.com/v1/policies"')
      );

      expect(spyOnError).toHaveBeenCalledTimes(1); // We check error logging in another test

      expect(spyOnInfo).toHaveBeenCalledTimes(1); // If there was not an error, info is called twice
      expect(spyOnInfo).toHaveBeenNthCalledWith(
        1,
        'id:1,url:undefined',
        'request-logger[1]: Request to [GET] https://pets.com/v1/policies'
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
