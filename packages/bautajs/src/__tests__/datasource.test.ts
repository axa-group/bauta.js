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
/* global expect, describe, test, afterEach, beforeEach */
import Events, { EventEmitter } from 'events';
import fs from 'fs';
import http from 'http';
import https from 'https';
import nock from 'nock';
import path from 'path';
import { logger, LoggerBuilder } from '../logger';
import { buildDataSource } from '../request/datasource';
import { Context, Logger, Metadata } from '../utils/types';

describe('datasource test', () => {
  describe('Request alias features', () => {
    afterEach(() => {
      nock.cleanAll();
    });
    test('should allow a request with application/json header using the field json as an object', async () => {
      const expected = { bender: 'ok' };
      nock('https://pets.com')
        .post('/v1/policies', '{"field1":"value"}')
        .reply(200, expected);

      const template = {
        id: 'op1',
        url: 'https://pets.com/v1/policies',
        method: 'POST',
        options: {
          json: {
            field1: 'value'
          }
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      const compiled = ctx.dataSource();
      const response = await compiled.request({ resolveBodyOnly: true });
      expect(response).toEqual(expected);
    });

    test('should allow a request with application/x-www-form-urlencoded using the field form as an object', async () => {
      const expected = { bender: 'ok' };
      nock('https://pets.com', {
        reqheaders: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      })
        .post('/v1/policies', {
          field1: 'value'
        })
        .reply(200, expected);

      const template = {
        id: 'op1',
        url: 'https://pets.com/v1/policies',
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      const compiled = ctx.dataSource();
      const response = await compiled.request({ resolveBodyOnly: true });
      expect(response).toEqual(expected);
    });
  });

  describe('Logs on requests', () => {
    afterEach(() => {
      nock.cleanAll();
    });
    test('should log the requests data on debug mode', async () => {
      process.env.LOG_LEVEL = 'debug';
      const expectedMsg = 'request-logger: Request data: ';
      const expectedData = {
        body: '{"password":"1234"}',
        headers:
          '{"user-agent":"bautaJS","connection":"keep-alive","accept":"application/json","accept-encoding":"gzip, deflate","content-type":"application/json","content-length":19}',
        method: 'GET',
        url: 'https://pets.com/v1/policies'
      };

      nock('https://pets.com')
        .get('/v1/policies')
        .reply(200, { bender: 'ok' });

      const template = {
        id: 'op1',
        url: 'https://pets.com/v1/policies',
        method: 'GET',
        options: {
          json: {
            password: '1234'
          }
        }
      };
      const debugLogs: any[] = [];

      const loggerMock: Logger = {
        ...logger
      };

      loggerMock.debug = jest.fn((...params: any[]) => debugLogs.push(params)) as any;
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: loggerMock
      };
      const compiled = ctx.dataSource();
      await compiled.request({ resolveBodyOnly: true });
      expect(debugLogs[0][0]).toEqual(expectedMsg);
      expect(debugLogs[0][1]).toEqual(expectedData);
    });

    test('should log the requests method and url info mode', async () => {
      process.env.LOG_LEVEL = 'info';
      const expectedMsg = 'request-logger: Request to [POST] https://pets.com/v1/policies';

      nock('https://pets.com')
        .post('/v1/policies', {
          field1: 'value'
        })
        .reply(200, { bender: 'ok' });

      const template = {
        id: 'op1',
        url: 'https://pets.com/v1/policies',
        method: 'POST',
        options: {
          json: {
            field1: 'value'
          }
        }
      };
      const infoLogs: any[] = [];
      const loggerMock = {
        ...logger
      };

      loggerMock.info = jest.fn((...params: any[]) => infoLogs.push(params)) as any;
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: loggerMock as Logger
      };
      const compiled = ctx.dataSource();
      await compiled.request({ resolveBodyOnly: true });
      expect(infoLogs[0][0]).toEqual(expectedMsg);
    });

    test('should log the requests data on debug mode if the request body is not a json', async () => {
      process.env.LOG_LEVEL = 'debug';
      const expectedMsg = 'request-logger: Request data: ';
      const expectedData = {
        body: 'someString',
        headers:
          '{"user-agent":"bautaJS","accept":"application/json","connection":"keep-alive","accept-encoding":"gzip, deflate","content-length":10}',
        method: 'GET',
        url: 'https://pets.com/v1/policies'
      };

      nock('https://pets.com')
        .get('/v1/policies')
        .reply(200, { bender: 'ok' });

      const template = {
        id: 'op1',
        url: 'https://pets.com/v1/policies',
        method: 'GET',
        options: {
          json: false,
          body: 'someString',
          headers: {
            accept: 'application/json'
          }
        }
      };
      const debugLogs: any[] = [];
      const loggerMock: Logger = {
        ...logger
      };

      loggerMock.debug = jest.fn((...params: any[]) => debugLogs.push(params)) as any;
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: loggerMock
      };
      const compiled = ctx.dataSource();
      await compiled.request({ resolveBodyOnly: true });

      expect(debugLogs[0][0]).toEqual(expectedMsg);
      expect(debugLogs[0][1]).toEqual(expectedData);
    });
  });

  describe('Logs on response', () => {
    afterEach(() => {
      nock.cleanAll();
    });
    test('should log an error if the response body could not be parsed', async () => {
      process.env.LOG_LEVEL = 'debug';
      // With nock got is not able to get the response method, doing a normal request this field is returned
      const expectedMsg = [
        'response-logger: Response for [GET]  https://pets.com/v1/policies: ',
        {
          body: '{"bender":1}',
          headers: '{"content-type":"application/json"}',
          statusCode: 200
        }
      ];

      nock('https://pets.com/v1')
        .get('/policies')
        .reply(200, { bender: 1 });

      const template = {
        id: 'op1',
        url: 'https://pets.com/v1/policies',
        method: 'GET'
      };
      const debugConsole: any[] = [];
      const infoConsole: any[] = [];
      const loggerMock: Logger = {
        ...logger
      };
      loggerMock.debug = jest.fn((...params: any[]) => debugConsole.push(params)) as any;
      loggerMock.info = jest.fn((...params: any[]) => infoConsole.push(params)) as any;
      const dataSource = buildDataSource(template);

      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: loggerMock
      };
      const compiled = ctx.dataSource();
      await compiled.request({ resolveBodyOnly: true });
      expect(debugConsole[1]).toEqual(expectedMsg);
    });

    test('should log the response time', async () => {
      process.env.LOG_LEVEL = 'info';
      const expectedMsg = new RegExp(
        'response-logger: The request to https://pets.com/v1/policies took: (.*) ms'
      );

      nock('https://pets.com/v1')
        .get('/policies')
        .reply(200, { bender: 1 });

      const template = {
        id: 'op1',
        url: 'https://pets.com/v1/policies',
        method: 'GET'
      };
      const infoConsole: any[] = [];
      const loggerMock: Logger = {
        ...logger
      };
      loggerMock.info = jest.fn((...params: any[]) => infoConsole.push(params)) as any;
      const dataSource = buildDataSource(template);

      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: loggerMock
      };
      const compiled = ctx.dataSource();
      await compiled.request({ resolveBodyOnly: true });
      expect(infoConsole[1][0]).toMatch(expectedMsg);
    });

    test('should not crash if the response body could not be parsed', async () => {
      process.env.LOG_LEVEL = 'debug';
      // With nock got is not able to get the response method, doing a normal request this field is returned
      const expectedMsg = [
        'response-logger: Response for [GET]  https://pets.com/v1/policies: ',
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

      const template = {
        id: 'op1',
        url: 'https://pets.com/v1/policies',
        method: 'GET',
        options: {
          json: false
        }
      };
      const debugConsole: any[] = [];
      const infoConsole: any[] = [];
      const loggerMock = {
        ...logger
      };

      loggerMock.debug = jest.fn((...params: any[]) => debugConsole.push(params)) as any;
      loggerMock.info = jest.fn((...params: any[]) => infoConsole.push(params)) as any;
      const dataSource = buildDataSource(template);

      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: loggerMock
      };
      const compiled = ctx.dataSource();
      await compiled.request({ resolveBodyOnly: true });
      expect(debugConsole[1]).toEqual(expectedMsg);
    });
  });

  describe('Proxy env variables', () => {
    const originalHttpRequest = http.request;
    const originalHttpsRequest = https.request;
    let emmiter: EventEmitter;
    beforeEach(() => {
      process.env.http_proxy = '';
      process.env.https_proxy = '';
      process.env.HTTP_PROXY = '';
      process.env.HTTPS_PROXY = '';
      emmiter = new Events();
      Object.assign(emmiter, { end: () => {} });
    });
    afterEach(() => {
      http.request = originalHttpRequest;
      https.request = originalHttpsRequest;
      emmiter.removeAllListeners();
    });
    test('should support the http_proxy variable', done => {
      const host = '192.168.1.5';
      const port = '3128';
      process.env.http_proxy = `http://${host}:${port}`;

      // @ts-ignore
      http.request = options => {
        expect(options.agent.options.host).toEqual(host);
        expect(options.agent.options.port).toEqual(port);
        done();

        return emmiter;
      };

      const template = {
        id: 'op1',
        url: 'http://pets.com/v1/policies',
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      const compiled = ctx.dataSource();
      compiled.request({ resolveBodyOnly: true });
    });

    test('should support the HTTP_PROXY variable', done => {
      const host = '192.168.1.6';
      const port = '3128';
      process.env.HTTP_PROXY = `http://${host}:${port}`;

      // @ts-ignore
      http.request = options => {
        expect(options.agent.options.host).toEqual(host);
        expect(options.agent.options.port).toEqual(port);
        done();

        return emmiter;
      };

      const template = {
        id: 'op1',
        url: 'http://pets.com/v1/policies',
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      const compiled = ctx.dataSource();
      compiled.request({ resolveBodyOnly: true });
    });

    test('should support not using proxy', done => {
      const host = 'pets.com';

      // @ts-ignore
      http.request = options => {
        expect(options.agent.options.host).toBeUndefined();
        expect(options.host).toEqual(host);
        done();

        return emmiter;
      };

      const template = {
        id: 'op1',
        url: `http://${host}/v1/policies`,
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      const compiled = ctx.dataSource();
      compiled.request({ resolveBodyOnly: true });
    });

    test('should support the http_proxy with authentication', done => {
      const host = '192.168.1.6';
      const port = 3128;
      const auth = 'user:passord';

      // @ts-ignore
      http.request = options => {
        expect(options.agent.options.host).toEqual(host);
        expect(options.agent.options.port).toEqual(port);
        expect(options.agent.options.headers['Proxy-Authorization']).toEqual(
          `Basic ${Buffer.from(auth).toString('base64')}`
        );
        done();

        return emmiter;
      };
      const template = {
        id: 'op1',
        url: 'http://pets.com/v1/policies',
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          },
          proxy: {
            host,
            port,
            auth
          }
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      const compiled = ctx.dataSource();
      compiled.request({ resolveBodyOnly: true });
    });

    test('should support https request throught a http proxy', done => {
      const host = '192.168.1.6';
      const port = '3128';
      process.env.HTTP_PROXY = `http://${host}:${port}`;

      // @ts-ignore
      https.request = options => {
        expect(options.agent.options.proxy.host).toEqual(host);
        expect(options.agent.options.proxy.port).toEqual(port);

        done();

        return emmiter;
      };

      const template = {
        id: 'op1',
        url: 'https://pets.com/v1/policies',
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      const compiled = ctx.dataSource();
      compiled.request({ resolveBodyOnly: true });
    });

    test('should support the HTTPS_PROXY variable and tunneling https proxy to http request', done => {
      const host = '192.168.1.7';
      const port = '3128';
      process.env.HTTPS_PROXY = `https://${host}:${port}`;

      // @ts-ignore
      http.request = options => {
        expect(options.agent.options.host).toEqual(host);
        expect(options.agent.options.port).toEqual(port);
        done();

        return emmiter;
      };

      const template = {
        id: 'op1',
        url: 'http://pets.com/v1/policies',
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      const compiled = ctx.dataSource();
      compiled.request({ resolveBodyOnly: true });
    });

    test('should support the HTTP_PROXY variable and tunneling https proxy to http request', done => {
      const host = '192.168.1.8';
      const port = '3128';
      process.env.HTTP_PROXY = `https://${host}:${port}`;

      // @ts-ignore
      http.request = options => {
        expect(options.agent.options.host).toEqual(host);
        expect(options.agent.options.port).toEqual(port);
        done();

        return emmiter;
      };

      const template = {
        id: 'op1',
        url: 'http://pets.com/v1/policies',
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      const compiled = ctx.dataSource();
      compiled.request({ resolveBodyOnly: true });
    });
  });

  describe('Multipart request', () => {
    test('Should build a new multipart request if the multipart options is set', async () => {
      nock('https://pets.com/v1')
        .post(
          '/policies',
          (body: any) =>
            body.includes('message.txt') &&
            body.includes('I am an attachment') &&
            // the attached file content
            body.includes('number of results to return, as sorted by increasing')
        )
        .reply(200, { ok: true });

      const template = {
        id: 'op1',
        url: 'https://pets.com/v1/policies',
        method: 'POST',
        options: {
          headers: {
            'content-type': 'multipart/related'
          },
          preambleCRLF: true,
          postambleCRLF: true
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      // Multipart won't work directly on the datasource template, because of the parsing
      const compiled = ctx.dataSource();
      const response = await compiled.request({
        multipart: [
          {
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              foo: 'bar',
              _attachments: {
                'message.txt': {
                  follows: true,
                  length: 18,
                  content_type: 'text/plain'
                }
              }
            })
          },
          { body: 'I am an attachment' },
          {
            body: fs.createReadStream(path.resolve(__dirname, './fixtures/test-path-schema.json'))
          }
        ],
        resolveBodyOnly: true
      });

      expect(response).toEqual({ ok: true });
    });

    test('Should build a new multipart request if multipart do not have data object', async () => {
      nock('https://pets.com/v1')
        .post(
          '/policies',
          (body: any) =>
            body.includes('message.txt') &&
            body.includes('I am an attachment') &&
            // the attached file content
            body.includes('number of results to return, as sorted by increasing')
        )
        .reply(200, { ok: true });

      const template = {
        id: 'op1',
        url: 'https://pets.com/v1/policies',
        method: 'POST',
        options: {
          headers: {
            'content-type': 'multipart/related'
          },
          preambleCRLF: true,
          postambleCRLF: true
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      // Multipart won't work directly on the datasource template, because of the parsing
      const compiled = ctx.dataSource();
      const response = await compiled.request({
        multipart: [
          {
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              foo: 'bar',
              _attachments: {
                'message.txt': {
                  follows: true,
                  length: 18,
                  content_type: 'text/plain'
                }
              }
            })
          },
          { body: 'I am an attachment' },
          {
            body: fs.createReadStream(path.resolve(__dirname, './fixtures/test-path-schema.json'))
          }
        ],
        resolveBodyOnly: true
      });

      expect(response).toEqual({ ok: true });
    });

    test('Should add the content type multipart related if is not set', async () => {
      nock('https://pets.com/v1')
        .matchHeader('content-type', /multipart\/related/g)
        .post(
          '/policies',
          (body: any) =>
            body.includes('message.txt') &&
            body.includes('I am an attachment') &&
            // the attached file content
            body.includes('number of results to return, as sorted by increasing')
        )
        .reply(200, { ok: true });

      const template = {
        id: 'op1',
        url: 'https://pets.com/v1/policies',
        method: 'POST',
        options: {
          preambleCRLF: true,
          postambleCRLF: true
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      // Multipart won't work directly on the datasource template, because of the parsing
      const compiled = ctx.dataSource();
      const response = await compiled.request({
        multipart: [
          {
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              foo: 'bar',
              _attachments: {
                'message.txt': {
                  follows: true,
                  length: 18,
                  content_type: 'text/plain'
                }
              }
            })
          },
          { body: 'I am an attachment' },
          {
            body: fs.createReadStream(path.resolve(__dirname, './fixtures/test-path-schema.json'))
          }
        ],
        resolveBodyOnly: true
      });

      expect(response).toEqual({ ok: true });
    });
  });

  describe('Form-data request', () => {
    test('Should allow a multipart/form-data request', async () => {
      nock('https://pets.com/v1')
        .post(
          '/policies',
          (body: any) =>
            body.includes('my_value') &&
            // the attached file content
            body.includes('number of results to return, as sorted by increasing')
        )
        .reply(200, { ok: true });

      const template = {
        id: 'op1',
        url: 'https://pets.com/v1/policies',
        method: 'POST',
        options: {
          preambleCRLF: true,
          postambleCRLF: true
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      // Multipart won't work directly on the datasource template, because of the parsing
      const compiled = ctx.dataSource();
      const response = await compiled.request({
        formData: {
          my_field: 'my_value',
          my_file: fs.createReadStream(path.resolve(__dirname, './fixtures/test-path-schema.json'))
        },
        resolveBodyOnly: true
      });

      expect(response).toEqual({ ok: true });
    });

    test('Should allow a multipart/form-data request with options and attachements', async () => {
      nock('https://pets.com/v1')
        .post(
          '/policies',
          (body: any) =>
            body.includes('my_value') &&
            // the attached file content
            body.includes('number of results to return, as sorted by increasing') &&
            body.includes('my-file.jpg') &&
            // test-datasource.json attachement
            body.includes('https://google.com/')
        )
        .reply(200, { ok: true });

      const template = {
        id: 'op1',
        url: 'https://pets.com/v1/policies',
        method: 'POST',
        options: {
          preambleCRLF: true,
          postambleCRLF: true
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      // Multipart won't work directly on the datasource template, because of the parsing
      const compiled = ctx.dataSource();
      const response = await compiled.request({
        formData: {
          my_field: 'my_value',
          custom_file: {
            value: fs.createReadStream(path.resolve(__dirname, './fixtures/test-path-schema.json')),
            options: {
              filename: 'my-file.jpg',
              contentType: 'image/jpeg'
            }
          },
          attachments: [
            fs.createReadStream(path.resolve(__dirname, './fixtures/test-path-schema.json')),
            fs.createReadStream(path.resolve(__dirname, './fixtures/test-datasource.json'))
          ]
        },
        resolveBodyOnly: true
      });

      expect(response).toEqual({ ok: true });
    });
  });

  describe('Timeout parser, fullResponse and stric ssl features', () => {
    const originalHttpRequest = http.request;
    const originalHttpsRequest = https.request;
    let emmiter: any;
    beforeEach(() => {
      emmiter = new Events();
      Object.assign(emmiter, { end: () => {} });
    });
    afterEach(() => {
      http.request = originalHttpRequest;
      https.request = originalHttpsRequest;
      emmiter.removeAllListeners();
    });

    test('Should set rejectUnauthorized as false by default', done => {
      http.request = (options: any) => {
        expect(options.agent.options.rejectUnauthorized).toEqual(false);
        done();

        return emmiter;
      };

      const template = {
        id: 'op1',
        url: 'http://pets.com/v1/policies',
        method: 'GET',
        options: {
          timeout: 5000
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      const compiled = ctx.dataSource();
      compiled.request({ resolveBodyOnly: true });
    });

    test('Should allow to set the agent rejectUnauthorized as true', done => {
      http.request = (options: any) => {
        expect(options.agent.options.rejectUnauthorized).toEqual(true);
        done();

        return emmiter;
      };

      const template = {
        id: 'op1',
        url: 'http://pets.com/v1/policies',
        method: 'GET',
        options: {
          timeout: 5000,
          rejectUnauthorized: true
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };

      const compiled = ctx.dataSource();
      compiled.request({ resolveBodyOnly: true });
    });

    test('Should allow to set the agent certificates', done => {
      http.request = (options: any) => {
        expect(options.agent.options.cert).toEqual('132');
        expect(options.agent.options.key).toEqual('123');
        done();

        return emmiter;
      };

      const template = {
        id: 'op1',
        url: 'http://pets.com/v1/policies',
        method: 'GET',
        options: {
          timeout: 5000,
          cert: '132',
          key: '123'
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };

      const compiled = ctx.dataSource();
      compiled.request({ resolveBodyOnly: true });
    });

    test('Should allow get the full response object', async () => {
      const expectedBody = { ok: true };
      nock('https://pets.com')
        .get('/v1/policies')
        .reply(200, expectedBody);

      const template = {
        id: 'op1',
        url: 'https://pets.com/v1/policies',
        method: 'GET'
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      const compiled = ctx.dataSource();
      const response = await compiled.request({ resolveBodyOnly: false });

      expect(response.body).toEqual(expectedBody);
      expect(response.headers).toEqual({ 'content-type': 'application/json' });
    });

    test('Should throw an error if a request is done without url', async () => {
      const template = {
        id: 'myads',
        method: 'GET',
        fullResponse: true
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: '',
        logger: new LoggerBuilder('test')
      };
      const compiled = ctx.dataSource();
      expect(() => compiled.request({ resolveBodyOnly: true })).toThrow(
        'URL is a mandatory parameter for a datasource request on operation: myads'
      );
    });

    test('Request parameters should override template fields', async () => {
      const expectedBody = { ok: true };
      nock('https://pets.com')
        .matchHeader('x-custom-header', 'override')
        .get('/v1/policies')
        .reply(200, expectedBody);

      const template = {
        id: 'op1',
        url: 'https://pets.com/v1/policies',
        method: 'GET'
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {},
        res: {},
        data: {},
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      const compiled = ctx.dataSource();
      const response = await compiled.request({
        headers: { 'x-custom-header': 'override' },
        resolveBodyOnly: true
      });

      expect(response).toEqual(expectedBody);
    });
  });

  describe('Datasource compile', () => {
    test('Datasource must compile complex templating properly', () => {
      const expected = {
        url: 'http://pets.com/v1/policies/toto/documents',
        method: 'GET',
        options: {
          timeout: '5000'
        },
        json: {
          foo: 'bar dead live & robots bar'
        }
      };
      const template = {
        id: 'op1',
        url: 'http://pets.com/v1/policies/{{ctx.req.id}}/documents',
        method: 'GET',
        options: {
          timeout: 5000,
          json: {
            foo: '{{ctx.data.bar}} dead live & robots {{ctx.data.bar}}'
          }
        }
      };
      const dataSource = buildDataSource(template);
      const ctx: Context<{}, {}> = {
        dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: { id: 'toto' },
        res: {},
        data: { bar: 'bar' },
        url: template.url,
        logger: new LoggerBuilder('test')
      };
      const { url, options } = ctx.dataSource();

      expect(url).toEqual(expected.url);
      expect(options && options.json && (options.json as any).foo).toEqual(expected.json.foo);
    });
  });
});
