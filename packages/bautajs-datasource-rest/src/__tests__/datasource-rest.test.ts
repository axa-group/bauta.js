/* eslint-disable global-require */
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
import nock from 'nock';
import { createContext, ContextLogger, BautaJS, Document, LoggerBuilder } from '@bautajs/core';
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

      const myContext = createContext({ req: {}, res: {} });
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

      const myContext = createContext({ req: {}, res: {} });
      const provider = restProvider(client => {
        return client.stream('http://pets.com/v1/policies', { responseType: 'json' });
      });
      const request1 = provider()(null, myContext, bautajs);

      myContext.token.cancel();
      await request1;
      expect((request1 as ResponseStream<any>).destroyed).toStrictEqual(true);
    });
  });

  describe('logs on requests', () => {
    beforeEach(() => {
      jest.resetModules();
    });
    test('should log the requests data on debug mode', async () => {
      process.env.LOG_LEVEL = 'debug';
      const { restProvider } = require('../index');
      const expectedMsg = 'request-logger[1]: Request data: ';
      const expectedData = {
        body: '{"test":"1234"}',
        headers: '{"user-agent":"got (https://github.com/sindresorhus/got)","x-request-id":1}',
        method: 'POST',
        url: 'https://pets.com/v1/policies'
      };

      nock('https://pets.com')
        .post('/v1/policies', { test: '1234' })
        .reply(200, { bender: 'ok' });
      const debugLogs: any[] = [];
      const loggerMock: ContextLogger = new LoggerBuilder('test');

      loggerMock.debug = jest.fn((...params: any[]) => debugLogs.push(params)) as any;
      const provider = restProvider(client => {
        return client.post('https://pets.com/v1/policies', {
          json: {
            test: '1234'
          },
          responseType: 'json'
        });
      });
      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} });
      ctx.logger = loggerMock;
      await provider()(null, ctx, bautajs);
      expect(debugLogs[0][0]).toStrictEqual(expectedMsg);
      expect(debugLogs[0][1]).toStrictEqual(expectedData);
    });

    test(`should not log the request id if it's not defined`, async () => {
      process.env.LOG_LEVEL = 'debug';
      const { restProvider } = require('../index');
      const expectedMsg = 'request-logger[No req id]: Request data: ';
      const expectedData = {
        body: '{"test":"1234"}',
        headers: '{"user-agent":"got (https://github.com/sindresorhus/got)"}',
        method: 'POST',
        url: 'https://pets.com/v1/policies'
      };

      nock('https://pets.com')
        .post('/v1/policies', { test: '1234' })
        .reply(200, { bender: 'ok' });
      const debugLogs: any[] = [];
      const loggerMock: ContextLogger = new LoggerBuilder('test');

      loggerMock.debug = jest.fn((...params: any[]) => debugLogs.push(params)) as any;
      const provider = restProvider(client => {
        return client.post('https://pets.com/v1/policies', {
          json: {
            test: '1234'
          },
          responseType: 'json'
        });
      });
      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} });
      ctx.logger = loggerMock;
      ctx.id = undefined;
      await provider()(null, ctx, bautajs);
      expect(debugLogs[0][0]).toStrictEqual(expectedMsg);
      expect(debugLogs[0][1]).toStrictEqual(expectedData);
    });

    test('should log the requests method and url info mode', async () => {
      process.env.LOG_LEVEL = 'info';
      const { restProvider } = require('../index');
      const expectedMsg = 'request-logger[1]: Request to [POST] https://pets.com/v1/policies';

      nock('https://pets.com')
        .post('/v1/policies', {
          test: '1234'
        })
        .reply(200, { bender: 'ok' });

      const infoLogs: any[] = [];
      const loggerMock: ContextLogger = new LoggerBuilder('test');

      loggerMock.info = jest.fn((...params: any[]) => infoLogs.push(params)) as any;

      const provider = restProvider(client => {
        return client.post('https://pets.com/v1/policies', {
          json: {
            test: '1234'
          },
          responseType: 'json'
        });
      });
      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} });
      ctx.logger = loggerMock;
      await provider()(null, ctx, bautajs);
      expect(infoLogs[0][0]).toStrictEqual(expectedMsg);
    });

    test('should log the requests data on debug mode if the request body is not a json', async () => {
      process.env.LOG_LEVEL = 'debug';
      const { restProvider } = require('../index');
      const expectedMsg = 'request-logger[1]: Request data: ';
      const expectedData = {
        body: 'someString',
        headers:
          '{"user-agent":"got (https://github.com/sindresorhus/got)","accept":"application/json","x-request-id":1}',
        method: 'POST',
        url: 'https://pets.com/v1/policies'
      };

      nock('https://pets.com')
        .post('/v1/policies', 'someString')
        .reply(200, { bender: 'ok' });

      const debugLogs: any[] = [];
      const loggerMock: ContextLogger = new LoggerBuilder('test');

      loggerMock.debug = jest.fn((...params: any[]) => debugLogs.push(params)) as any;
      const provider = restProvider(client => {
        return client.post('https://pets.com/v1/policies', {
          body: 'someString',
          headers: {
            accept: 'application/json'
          },
          responseType: 'json'
        });
      });
      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} });
      ctx.logger = loggerMock;
      await provider()(null, ctx, bautajs);

      expect(debugLogs[0][0]).toStrictEqual(expectedMsg);
      expect(debugLogs[0][1]).toStrictEqual(expectedData);
    });
  });

  describe('logs on response', () => {
    beforeEach(() => {
      jest.resetModules();
    });
    test('should log a network error', async () => {
      process.env.LOG_LEVEL = 'debug';
      const { restProvider } = require('../index');
      // With nock got is not able to get the response method, doing a normal request this field is returned
      const expectedMsg = [
        'response-logger[1]: Error for [GET] https://pets.com/v1/policies:',
        {
          code: undefined,
          name: 'RequestError',
          message: 'something awful happened'
        }
      ];

      nock('https://pets.com/v1')
        .get('/policies')
        .replyWithError('something awful happened');

      const errorConsole: any[] = [];
      const loggerMock: ContextLogger = new LoggerBuilder('test');
      loggerMock.error = jest.fn((...params: any[]) => errorConsole.push(params)) as any;

      const provider = restProvider(client => {
        return client.get('https://pets.com/v1/policies', {
          responseType: 'json'
        });
      });
      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} });
      ctx.logger = loggerMock;
      try {
        await provider()(null, ctx, bautajs);
      } catch (e) {
        // Empty
      }
      expect(errorConsole[0]).toStrictEqual(expectedMsg);
    });

    test('should not log the id if no id is provided', async () => {
      process.env.LOG_LEVEL = 'debug';
      const { restProvider } = require('../index');
      // With nock got is not able to get the response method, doing a normal request this field is returned
      const expectedMsg = [
        'response-logger[No req id]: Response for [GET] https://pets.com/v1/policies: ',
        {
          body: '{"bender":1}',
          headers: '{"content-type":"application/json"}',
          statusCode: 200
        }
      ];

      nock('https://pets.com/v1')
        .get('/policies')
        .reply(200, { bender: 1 });

      const debugConsole: any[] = [];
      const infoConsole: any[] = [];
      const loggerMock: ContextLogger = new LoggerBuilder('test');
      loggerMock.debug = jest.fn((...params: any[]) => debugConsole.push(params)) as any;
      loggerMock.info = jest.fn((...params: any[]) => infoConsole.push(params)) as any;

      const provider = restProvider(client => {
        return client.get('https://pets.com/v1/policies', {
          responseType: 'json'
        });
      });
      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} });
      ctx.logger = loggerMock;
      ctx.id = undefined;
      await provider()(null, ctx, bautajs);
      expect(debugConsole[1]).toStrictEqual(expectedMsg);
    });

    test('should log an error if the response body could not be parsed', async () => {
      process.env.LOG_LEVEL = 'debug';
      const { restProvider } = require('../index');
      const expectedMsg = [
        'response-logger[1]: Response for [GET] https://pets.com/v1/policies: ',
        {
          body: '{"bender":1}',
          headers: '{"content-type":"application/json"}',
          statusCode: 200
        }
      ];

      nock('https://pets.com/v1')
        .get('/policies')
        .reply(200, { bender: 1 });

      const debugConsole: any[] = [];
      const infoConsole: any[] = [];
      const loggerMock: ContextLogger = new LoggerBuilder('test');
      loggerMock.debug = jest.fn((...params: any[]) => debugConsole.push(params)) as any;
      loggerMock.info = jest.fn((...params: any[]) => infoConsole.push(params)) as any;

      const provider = restProvider(client => {
        return client.get('https://pets.com/v1/policies', {
          responseType: 'json'
        });
      });
      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} });
      ctx.logger = loggerMock;
      await provider()(null, ctx, bautajs);
      expect(debugConsole[1]).toStrictEqual(expectedMsg);
    });

    test('should log the response time', async () => {
      process.env.LOG_LEVEL = 'info';
      const { restProvider } = require('../index');
      const expectedMsg = new RegExp(
        'response-logger\\[1\\]: The request to https://pets.com/v1/policies took: (.*) ms'
      );

      nock('https://pets.com/v1')
        .get('/policies')
        .reply(200, { bender: 1 });

      const infoConsole: any[] = [];
      const loggerMock: ContextLogger = new LoggerBuilder('test');
      loggerMock.info = jest.fn((...params: any[]) => infoConsole.push(params)) as any;

      const provider = restProvider(client => {
        return client.get('https://pets.com/v1/policies', {
          responseType: 'json'
        });
      });
      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} });
      ctx.logger = loggerMock;
      await provider()(null, ctx, bautajs);
      expect(infoConsole[1][0]).toMatch(expectedMsg);
    });

    test('should not crash if the response body could not be parsed', async () => {
      process.env.LOG_LEVEL = 'debug';
      const { restProvider } = require('../index');
      const expectedMsg = [
        'response-logger[1]: Response for [GET] https://pets.com/v1/policies: ',
        {
          body: '<html><div></div></html>',
          headers: '{"content-type":"text/html"}',
          statusCode: 200
        }
      ];

      nock('https://pets.com/v1')
        .get('/policies')
        .reply(200, '<html><div></div></html>', {
          'content-type': 'text/html'
        });

      const debugConsole: any[] = [];
      const infoConsole: any[] = [];
      const loggerMock: ContextLogger = new LoggerBuilder('test');

      loggerMock.debug = jest.fn((...params: any[]) => debugConsole.push(params)) as any;
      loggerMock.info = jest.fn((...params: any[]) => infoConsole.push(params)) as any;

      const provider = restProvider(client => {
        return client.get('https://pets.com/v1/policies', {
          responseType: 'text'
        });
      });
      const ctx = createContext({ req: { headers: { 'request-id': 1 } }, res: {} });
      ctx.logger = loggerMock;
      await provider()(null, ctx, bautajs);
      expect(debugConsole[1]).toStrictEqual(expectedMsg);
    });
  });
});
