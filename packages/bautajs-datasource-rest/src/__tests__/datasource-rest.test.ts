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
import Events from 'events';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { createHttpsAgent } from 'native-proxy-agent';
import nock from 'nock';
import path from 'path';
import {
  BautaJSInstance,
  Context,
  Document,
  logger,
  LoggerBuilder,
  createContext
} from '@bautajs/core';
import { ContextLogger } from '@bautajs/core/src';
import { restDataSource, restDataSourceTemplate } from '../datasource-rest';
import { CompiledRestProvider } from '../utils/types';

describe('datasource rest test', () => {
  let context: Context;
  let bautaInstance: BautaJSInstance;
  beforeEach(() => {
    context = createContext({
      req: { headers: { 'request-id': 1 } },
      res: {}
    });
    bautaInstance = {
      operations: {},
      staticConfig: {},
      logger: new LoggerBuilder('test'),
      apiDefinitions: {} as Document[]
    };
  });
  afterEach(() => {
    nock.cleanAll();
  });
  describe('request alias features', () => {
    test('should allow a request with application/json header using the field json as an object', async () => {
      const expected = { bender: 'ok' };
      nock('https://pets.com')
        .post('/v1/policies', '{"field1":"value"}')
        .reply(200, expected);

      const template = {
        providers: [
          {
            id: 'op1',
            options: {
              url: 'https://pets.com/v1/policies',
              method: 'POST',
              json: {
                field1: 'value'
              }
            }
          }
        ]
      };
      const datasource = restDataSource(template);
      const response = await datasource.op1({ resolveBodyOnly: true })(
        null,
        context,
        bautaInstance
      );
      expect(response).toStrictEqual(expected);
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
        providers: [
          {
            id: 'op1',
            options: {
              url: 'https://pets.com/v1/policies',
              method: 'POST',
              form: {
                field1: 'value'
              }
            }
          }
        ]
      };
      const datasource = restDataSource(template);
      const response = await datasource.op1({ resolveBodyOnly: true })(
        null,
        context,
        bautaInstance
      );
      expect(response).toStrictEqual(expected);
    });
  });

  describe('logs on requests', () => {
    test('should log the requests data on debug mode', async () => {
      process.env.LOG_LEVEL = 'debug';
      const expectedMsg = 'request-logger: Request data: ';
      const expectedData = {
        body: '{"password":"1234"}',
        headers:
          '{"user-agent":"bautaJS","x-request-id":1,"accept":"application/json","accept-encoding":"gzip, deflate","content-type":"application/json","content-length":19}',
        method: 'POST',
        url: 'https://pets.com/v1/policies'
      };

      nock('https://pets.com')
        .post('/v1/policies')
        .reply(200, { bender: 'ok' });

      const template = {
        providers: [
          {
            id: 'op1',
            options: {
              url: 'https://pets.com/v1/policies',
              method: 'POST',
              json: {
                password: '1234'
              }
            }
          }
        ]
      };
      const debugLogs: any[] = [];

      const loggerMock: ContextLogger = {
        ...logger
      };

      loggerMock.debug = jest.fn((...params: any[]) => debugLogs.push(params)) as any;
      const datasource = restDataSource(template);
      await datasource.op1({ resolveBodyOnly: true })(
        null,
        { ...context, logger: loggerMock },
        bautaInstance
      );
      expect(debugLogs[0][0]).toStrictEqual(expectedMsg);
      expect(debugLogs[0][1]).toStrictEqual(expectedData);
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
        providers: [
          {
            id: 'op1',
            options: {
              url: 'https://pets.com/v1/policies',
              method: 'POST',
              json: {
                field1: 'value'
              }
            }
          }
        ]
      };

      const infoLogs: any[] = [];
      const loggerMock = {
        ...logger
      };

      loggerMock.info = jest.fn((...params: any[]) => infoLogs.push(params)) as any;

      const datasource = restDataSource(template);
      await datasource.op1({ resolveBodyOnly: true })(
        null,
        { ...context, logger: loggerMock },
        bautaInstance
      );
      expect(infoLogs[0][0]).toStrictEqual(expectedMsg);
    });

    test('should log the requests data on debug mode if the request body is not a json', async () => {
      process.env.LOG_LEVEL = 'debug';
      const expectedMsg = 'request-logger: Request data: ';
      const expectedData = {
        body: 'someString',
        headers:
          '{"user-agent":"bautaJS","accept":"application/json","x-request-id":1,"accept-encoding":"gzip, deflate","content-length":10}',
        method: 'POST',
        url: 'https://pets.com/v1/policies'
      };

      nock('https://pets.com')
        .post('/v1/policies')
        .reply(200, { bender: 'ok' });

      const template = {
        providers: [
          {
            id: 'op1',
            options: {
              url: 'https://pets.com/v1/policies',
              method: 'POST',
              json: false,
              body: 'someString',
              headers: {
                accept: 'application/json'
              }
            }
          }
        ]
      };
      const debugLogs: any[] = [];
      const loggerMock: ContextLogger = {
        ...logger
      };

      loggerMock.debug = jest.fn((...params: any[]) => debugLogs.push(params)) as any;
      const datasource = restDataSource(template);
      await datasource.op1({ resolveBodyOnly: true })(
        null,
        { ...context, logger: loggerMock },
        bautaInstance
      );

      expect(debugLogs[0][0]).toStrictEqual(expectedMsg);
      expect(debugLogs[0][1]).toStrictEqual(expectedData);
    });
  });

  describe('logs on response', () => {
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
        providers: [
          {
            id: 'op1',
            options: {
              url: 'https://pets.com/v1/policies',
              method: 'GET'
            }
          }
        ]
      };
      const debugConsole: any[] = [];
      const infoConsole: any[] = [];
      const loggerMock: ContextLogger = {
        ...logger
      };
      loggerMock.debug = jest.fn((...params: any[]) => debugConsole.push(params)) as any;
      loggerMock.info = jest.fn((...params: any[]) => infoConsole.push(params)) as any;

      const datasource = restDataSource(template);
      await datasource.op1({ resolveBodyOnly: true })(
        null,
        { ...context, logger: loggerMock },
        bautaInstance
      );
      expect(debugConsole[1]).toStrictEqual(expectedMsg);
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
        providers: [
          {
            id: 'op1',
            options: {
              url: 'https://pets.com/v1/policies',
              method: 'GET'
            }
          }
        ]
      };
      const infoConsole: any[] = [];
      const loggerMock: ContextLogger = {
        ...logger
      };
      loggerMock.info = jest.fn((...params: any[]) => infoConsole.push(params)) as any;

      const datasource = restDataSource(template);
      await datasource.op1({ resolveBodyOnly: true })(
        null,
        { ...context, logger: loggerMock },
        bautaInstance
      );
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
        providers: [
          {
            id: 'op1',
            options: {
              url: 'https://pets.com/v1/policies',
              method: 'GET',
              json: false
            }
          }
        ]
      };
      const debugConsole: any[] = [];
      const infoConsole: any[] = [];
      const loggerMock = {
        ...logger
      };

      loggerMock.debug = jest.fn((...params: any[]) => debugConsole.push(params)) as any;
      loggerMock.info = jest.fn((...params: any[]) => infoConsole.push(params)) as any;

      const datasource = restDataSource(template);
      await datasource.op1({ resolveBodyOnly: true })(
        null,
        { ...context, logger: loggerMock },
        bautaInstance
      );
      expect(debugConsole[1]).toStrictEqual(expectedMsg);
    });
  });

  describe('multipart request', () => {
    test('should build a new multipart request if the multipart options is set', async () => {
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
        providers: [
          {
            id: 'op1',
            options: {
              url: 'https://pets.com/v1/policies',
              method: 'POST',
              headers: {
                'content-type': 'multipart/related'
              },
              preambleCRLF: true,
              postambleCRLF: true
            }
          }
        ]
      };
      const datasource = restDataSource(template);
      const response = await datasource.op1({
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
      })(null, context, bautaInstance);

      expect(response).toStrictEqual({ ok: true });
    });

    test('should build a new multipart request if multipart do not have data object', async () => {
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
        providers: [
          {
            id: 'op1',
            options: {
              url: 'https://pets.com/v1/policies',
              method: 'POST',
              headers: {
                'content-type': 'multipart/related'
              },
              preambleCRLF: true,
              postambleCRLF: true
            }
          }
        ]
      };
      const datasource = restDataSource(template);
      const response = await datasource.op1({
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
      })(null, context, bautaInstance);
      expect(response).toStrictEqual({ ok: true });
    });

    test('should add the content type multipart related if is not set', async () => {
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
        providers: [
          {
            id: 'op1',
            options: {
              url: 'https://pets.com/v1/policies',
              method: 'POST',
              preambleCRLF: true,
              postambleCRLF: true
            }
          }
        ]
      };
      const datasource = restDataSource(template);
      const response = await datasource.op1({
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
      })(null, context, bautaInstance);

      expect(response).toStrictEqual({ ok: true });
    });
  });

  describe('form-data request', () => {
    test('should allow a multipart/form-data request', async () => {
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
        providers: [
          {
            id: 'op1',
            options: {
              url: 'https://pets.com/v1/policies',
              method: 'POST',
              preambleCRLF: true,
              postambleCRLF: true
            }
          }
        ]
      };
      const datasource = restDataSource(template);
      const response = await datasource.op1({
        formData: {
          my_field: 'my_value',
          my_file: fs.createReadStream(path.resolve(__dirname, './fixtures/test-path-schema.json'))
        },
        resolveBodyOnly: true
      })(null, context, bautaInstance);

      expect(response).toStrictEqual({ ok: true });
    });

    test('should allow a multipart/form-data request with options and attachements', async () => {
      nock('https://pets.com/v1')
        .post(
          '/policies',
          (body: any) =>
            body.includes('my_value') &&
            // the attached file content
            body.includes('number of results to return, as sorted by increasing') &&
            body.includes('my-file.jpg')
        )
        .reply(200, { ok: true });

      const template = {
        providers: [
          {
            id: 'op1',
            options: {
              url: 'https://pets.com/v1/policies',
              method: 'POST',
              preambleCRLF: true,
              postambleCRLF: true
            }
          }
        ]
      };
      const datasource = restDataSource(template);
      const response = await datasource.op1({
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
            fs.createReadStream(path.resolve(__dirname, './fixtures/test-path-schema.json'))
          ]
        },
        resolveBodyOnly: true
      })(null, context, bautaInstance);

      expect(response).toStrictEqual({ ok: true });
    });
  });

  describe('timeout parser, fullResponse and stric ssl features', () => {
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

    test('should set rejectUnauthorized as true by default', async () => {
      nock('http://pets.com')
        .get('/v1/policies')
        .reply(200, {});
      http.request = (options: any, cb: any) => {
        expect(options.agent.options.rejectUnauthorized).toBeUndefined();

        return originalHttpRequest(options, cb);
      };
      const template = {
        providers: [
          {
            id: 'op1',
            options: {
              url: 'http://pets.com/v1/policies',
              method: 'GET'
            }
          }
        ]
      };
      expect.assertions(1);
      const datasource = restDataSource(template);
      await datasource.op1({
        resolveBodyOnly: true
      })(null, context, bautaInstance);
    });

    test('should allow to set a custom agent', async () => {
      nock('http://pets.com')
        .post('/v1/policies')
        .reply(200, {});
      await new Promise(done => {
        https.request = (options: any) => {
          expect(options.agent.keepAliveMsecs).toStrictEqual(5000);
          done();

          return emmiter;
        };
        const template = {
          providers: [
            {
              id: 'op1',
              options: {
                url: 'https://pets.com/v1/policies',
                method: 'POST',
                timeout: 5000,
                agent: createHttpsAgent({
                  keepAliveMsecs: 5000
                })
              }
            }
          ]
        };

        const datasource = restDataSource(template);
        datasource.op1({
          resolveBodyOnly: true
        })(null, context, bautaInstance);
      });
    });

    test('should allow to set the agent certificates by a custom agent', async () => {
      nock('http://pets.com')
        .get('/v1/policies')
        .reply(200, {});
      http.request = (options: any, cb: any) => {
        expect(options.agent.options.cert).toStrictEqual('132');
        expect(options.agent.options.key).toStrictEqual('123');

        return originalHttpRequest(options, cb);
      };

      const template = {
        providers: [
          {
            id: 'op1',
            options: {
              url: 'http://pets.com/v1/policies',
              method: 'GET',
              timeout: 5000,
              agent: createHttpsAgent({
                cert: '132',
                key: '123'
              })
            }
          }
        ]
      };
      const datasource = restDataSource(template);
      expect.assertions(2);
      await datasource.op1({
        resolveBodyOnly: true
      })(null, context, bautaInstance);
    });

    test('should allow get the full response object', async () => {
      const expectedBody = { ok: true };
      nock('https://pets.com')
        .get('/v1/policies')
        .reply(200, expectedBody);
      const template = {
        providers: [
          {
            id: 'op1',
            options: {
              url: 'https://pets.com/v1/policies',
              method: 'GET'
            }
          }
        ]
      };
      const datasource = restDataSource(template);
      const response = await datasource.op1({
        resolveBodyOnly: false
      })(null, context, bautaInstance);

      expect(response.body).toStrictEqual(expectedBody);
      expect(response.headers).toStrictEqual({ 'content-type': 'application/json' });
    });

    test('should throw an error if a request is done without url', async () => {
      const template = {
        providers: [
          {
            id: 'myads',
            options: {
              method: 'GET'
            }
          }
        ]
      };
      const datasource = restDataSource(template);
      expect(() =>
        datasource.myads({
          resolveBodyOnly: false
        })(null, context, bautaInstance)
      ).toThrow('URL is a mandatory parameter for a datasource request on operation: myads');
    });

    test('request parameters should override template fields', async () => {
      const expectedBody = { ok: true };
      nock('https://pets.com')
        .matchHeader('x-custom-header', 'override')
        .get('/v1/policies')
        .reply(200, expectedBody);

      const template = {
        providers: [
          {
            id: 'op1',
            options: {
              url: 'https://pets.com/v1/policies',
              method: 'GET'
            }
          }
        ]
      };
      const datasource = restDataSource(template);
      const response = await datasource.op1({
        headers: { 'x-custom-header': 'override' },
        resolveBodyOnly: true
      })(null, context, bautaInstance);

      expect(response).toStrictEqual(expectedBody);
      expect(nock.isDone()).toBe(true);
    });
  });

  describe('datasource compile', () => {
    test('datasource must compile complex templating properly as a function', async () => {
      nock('http://pets.com')
        .get('/v1/policies/toto/documents')
        .reply(200, {});
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
        providers: [
          {
            id: 'op1',
            options(_: any, ctx: Context) {
              return {
                url: `http://pets.com/v1/policies/${ctx.req.id}/documents`,
                method: 'GET',
                json: {
                  foo: `${ctx.data.bar} dead live & robots ${ctx.data.bar}`
                }
              };
            }
          }
        ]
      };
      const datasource = restDataSource(template);
      expect.assertions(2);
      await datasource.op1.compile(
        (_: any, _ctx: any, _bautajs: any, provider: CompiledRestProvider) => {
          expect(provider.options && provider.options.url).toStrictEqual(expected.url);
          expect(
            provider.options && provider.options.json && (provider.options.json as any).foo
          ).toStrictEqual(expected.json.foo);
        }
      )(null, { ...context, req: { id: 'toto' }, data: { bar: 'bar' } }, bautaInstance);
    });

    test('datasource must compile complex templating properly as a JSON template', async () => {
      nock('http://pets.com')
        .get('/v1/policies/toto/documents')
        .reply(200, {});
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
        providers: [
          {
            id: 'op1',
            options: {
              url: 'http://pets.com/v1/policies/{{ctx.req.id}}/documents',
              method: 'GET',
              json: {
                foo: '{{ctx.data.bar}} dead live & robots {{ctx.data.bar}}'
              }
            }
          }
        ]
      };
      const datasource = restDataSourceTemplate(template);
      expect.assertions(2);
      await datasource.op1.compile(
        (_: any, _ctx: any, _bautajs: any, provider: CompiledRestProvider) => {
          expect(provider.options && provider.options.url).toStrictEqual(expected.url);
          expect(
            provider.options && provider.options.json && (provider.options.json as any).foo
          ).toStrictEqual(expected.json.foo);
        }
      )(null, { ...context, req: { id: 'toto' }, data: { bar: 'bar' } }, bautaInstance);
    });

    test('should merge global options with local options and local options have priority', async () => {
      nock('http://pets.com')
        .get('/v1/policies/toto/documents')
        .reply(200, {});
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
        options: {
          headers: {
            'x-header': 1
          }
        },
        providers: [
          {
            id: 'op1',
            options: {
              url: 'http://pets.com/v1/policies/{{ctx.req.id}}/documents',
              method: 'GET',
              headers: {
                token: '{{ctx.data.token}}'
              },
              json: {
                foo: '{{ctx.data.bar}} dead live & robots {{ctx.data.bar}}'
              }
            }
          }
        ]
      };
      const datasource = restDataSourceTemplate(template);
      expect.assertions(4);
      await datasource.op1.compile(
        (_: any, _ctx: any, _bautajs: any, provider: CompiledRestProvider) => {
          expect(provider.options && provider.options.url).toStrictEqual(expected.url);
          expect(
            provider.options && provider.options.json && (provider.options.json as any).foo
          ).toStrictEqual(expected.json.foo);
          expect(
            provider.options && provider.options.headers && provider.options.headers.token
          ).toStrictEqual('1234');
          expect(
            provider.options && provider.options.headers && provider.options.headers['x-header']
          ).toStrictEqual(1);
        }
      )(
        null,
        { ...context, req: { id: 'toto' }, data: { bar: 'bar', token: '1234' } },
        bautaInstance
      );
    });

    test('should compile a restDataSourceTemplate', async () => {
      nock('http://pets.com')
        .get('/v1/policies/toto/documents')
        .reply(200, {});
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
        options: {
          headers: {
            'x-header': 1
          }
        },
        providers: [
          {
            id: 'op1',
            options: {
              url: 'http://pets.com/v1/policies/{{ctx.req.id}}/documents',
              method: 'GET',
              headers: {
                token: '{{ctx.data.token}}'
              },
              json: {
                foo: '{{ctx.data.bar}} dead live & robots {{ctx.data.bar}}'
              }
            }
          }
        ]
      };
      const datasource = restDataSourceTemplate(template);
      expect.assertions(2);
      await datasource.op1.compile(
        (_: any, _ctx: any, _bautajs: any, provider: CompiledRestProvider) => {
          expect(provider.options && provider.options.url).toStrictEqual(expected.url);
          expect(
            provider.options && provider.options.json && (provider.options.json as any).foo
          ).toStrictEqual(expected.json.foo);
        }
      )(null, { ...context, req: { id: 'toto' }, data: { bar: 'bar', token: '1' } }, bautaInstance);
    });
  });
  describe('request cancelation', () => {
    test('should cancel the request if the a cancel is executed', async () => {
      nock('http://pets.com')
        .get('/v1/policies')
        .reply(200, {});

      const myContext = { ...context, req: { id: 'toto' }, data: { bar: 'bar' } };
      const template = {
        providers: [
          {
            id: 'op1',
            options() {
              return {
                url: `http://pets.com/v1/policies`,
                method: 'GET'
              };
            }
          }
        ]
      };
      const datasource = restDataSource(template);
      const request1 = datasource.op1({
        resolveBodyOnly: true
      })(null, myContext, bautaInstance);

      myContext.token.cancel();

      await expect(request1).rejects.toThrow(
        expect.objectContaining({ message: 'Promise was canceled' })
      );
    });
  });
});
