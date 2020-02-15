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
/* global expect, describe, test, afterEach, beforeEach */
const { createHttpAgent } = require('native-proxy-agent');
const nock = require('nock');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const EventEmitter = require('events');
const buildDataSource = require('../../request/datasource');
const { clearAgentStoreage } = require('../../request/agent');
const logger = require('../../logger');

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
        url: 'https://pets.com/v1/policies',
        method: 'POST',
        options: {
          json: {
            field1: 'value'
          }
        }
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({});
      const response = await compiled.request();
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
        url: 'https://pets.com/v1/policies',
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({});
      const response = await compiled.request();
      expect(response).toEqual(expected);
    });
  });

  describe('Logs on requests', () => {
    afterEach(() => {
      nock.cleanAll();
    });

    test('should log the response if the response is an error', async () => {
      process.env.LOG_LEVEL = 'error';
      const expectedMsg = 'request-logger: Error for [POST] https://pets.com/v1/policies:';
      const expectedData = {
        body: '{"bender":"error"}',
        statusCode: 400
      };

      nock('https://pets.com')
        .post('/v1/policies')
        .reply(400, { bender: 'error' });

      const template = {
        url: 'https://pets.com/v1/policies',
        method: 'POST',
        options: {
          json: {
            password: '1234'
          }
        }
      };
      const errorLogs = [];
      const loggerMock = {
        ...logger,
        error(...params) {
          errorLogs.push(params);
        },
        debug() {},
        info() {},
        warn() {}
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({ logger: loggerMock });
      await compiled.request().catch(() => Promise.resolve({}));
      expect(errorLogs[0][0]).toEqual(expectedMsg);
      expect(errorLogs[0][1]).toEqual(expectedData);
    });
    test('should log the requests data on debug mode', async () => {
      process.env.LOG_LEVEL = 'debug';
      const expectedMsg = 'request-logger: Request data: ';
      const expectedData = {
        body: '{"password":"1234"}',
        headers:
          '{"user-agent":"bautaJS","accept":"application/json","accept-encoding":"gzip, deflate","content-type":"application/json","content-length":19}',
        method: 'GET',
        url: 'https://pets.com/v1/policies'
      };

      nock('https://pets.com')
        .get('/v1/policies')
        .reply(200, { bender: 'ok' });

      const template = {
        url: 'https://pets.com/v1/policies',
        method: 'GET',
        options: {
          json: {
            password: '1234'
          }
        }
      };
      const debugLogs = [];
      const loggerMock = {
        ...logger,
        debug(...params) {
          debugLogs.push(params);
        },
        info() {},
        warn() {}
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({ logger: loggerMock });
      await compiled.request();
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
        url: 'https://pets.com/v1/policies',
        method: 'POST',
        options: {
          json: {
            field1: 'value'
          }
        }
      };
      const infoLogs = [];
      const loggerMock = {
        ...logger,
        info: (...params) => {
          infoLogs.push(params);
        },
        debug() {},
        warn() {}
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({ logger: loggerMock });
      await compiled.request();
      expect(infoLogs[0][0]).toEqual(expectedMsg);
    });

    test('should log the requests data on debug mode if the request body is not a json', async () => {
      process.env.LOG_LEVEL = 'debug';
      const expectedMsg = 'request-logger: Request data: ';
      const expectedData = {
        body: 'someString',
        headers:
          '{"user-agent":"bautaJS","accept":"application/json","accept-encoding":"gzip, deflate","content-length":10}',
        method: 'GET',
        url: 'https://pets.com/v1/policies'
      };

      nock('https://pets.com')
        .get('/v1/policies')
        .reply(200, { bender: 'ok' });

      const template = {
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
      const debugLogs = [];
      const loggerMock = {
        ...logger,
        debug(...params) {
          debugLogs.push(params);
        },
        info() {},
        warn() {}
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({ logger: loggerMock });
      await compiled.request();

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
        'request-logger: Response for [GET] https://pets.com/v1/policies:',
        { body: '{"bender":1}', headers: '{"content-type":"application/json"}', statusCode: 200 }
      ];

      nock('https://pets.com/v1')
        .get('/policies')
        .reply(200, { bender: 1 });

      const template = {
        url: 'https://pets.com/v1/policies',
        method: 'GET'
      };
      const debugConsole = [];
      const infoConsole = [];
      const loggerMock = {
        ...logger,
        debug: (...params) => {
          debugConsole.push(params);
        },
        info: (...params) => {
          infoConsole.push(params);
        },
        warn() {}
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({ logger: loggerMock });
      await compiled.request();
      expect(debugConsole[1]).toEqual(expectedMsg);
    });

    test('should log the response time', async () => {
      process.env.LOG_LEVEL = 'info';
      const expectedMsg = new RegExp(
        'request-logger: The request to https://pets.com/v1/policies took: (.*) ms'
      );

      nock('https://pets.com/v1')
        .get('/policies')
        .reply(200, { bender: 1 });

      const template = {
        url: 'https://pets.com/v1/policies',
        method: 'GET'
      };
      const infoConsole = [];
      const loggerMock = {
        ...logger,
        info: (...params) => {
          infoConsole.push(params);
        }
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({ logger: loggerMock });
      await compiled.request();
      expect(infoConsole[1][0]).toMatch(expectedMsg);
    });

    test('should not crash if the response body could not be parsed', async () => {
      process.env.LOG_LEVEL = 'debug';
      // With nock got is not able to get the response method, doing a normal request this field is returned
      const expectedMsg = [
        'request-logger: Response for [GET] https://pets.com/v1/policies:',
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
        url: 'https://pets.com/v1/policies',
        method: 'GET',
        options: {
          json: false
        }
      };
      const debugConsole = [];
      const infoConsole = [];
      const loggerMock = {
        ...logger,
        debug: (...params) => {
          debugConsole.push(params);
        },
        info: (...params) => {
          infoConsole.push(params);
        },
        warn() {}
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({ logger: loggerMock });
      await compiled.request();
      expect(debugConsole[1]).toEqual(expectedMsg);
    });
  });

  describe('Multipart request', () => {
    test('Should build a new multipart request if the multipart options is set', async () => {
      nock('https://pets.com/v1')
        .post(
          '/policies',
          body =>
            body.includes('message.txt') &&
            body.includes('I am an attachment') &&
            // the attached file content
            body.includes('number of results to return, as sorted by increasing')
        )
        .reply(200, { ok: true });

      const template = {
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
      // Multipart won't work directly on the datasource template, because of the parsing
      const compiled = dataSource({});
      const response = await compiled.request({
        multipart: {
          chunked: false,
          data: [
            {
              'content-type': 'application/json',
              body: JSON.stringify({
                foo: 'bar',
                _attachments: {
                  'message.txt': { follows: true, length: 18, content_type: 'text/plain' }
                }
              })
            },
            { body: 'I am an attachment' },
            {
              body: fs.createReadStream(
                path.resolve(__dirname, '../fixtures/test-path-schema.json')
              )
            }
          ]
        }
      });

      expect(response).toEqual({ ok: true });
    });

    test('Should build a new multipart request if multipart do not have data object', async () => {
      nock('https://pets.com/v1')
        .post(
          '/policies',
          body =>
            body.includes('message.txt') &&
            body.includes('I am an attachment') &&
            // the attached file content
            body.includes('number of results to return, as sorted by increasing')
        )
        .reply(200, { ok: true });

      const template = {
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
      // Multipart won't work directly on the datasource template, because of the parsing
      const compiled = dataSource({});
      const response = await compiled.request({
        multipart: [
          {
            'content-type': 'application/json',
            body: JSON.stringify({
              foo: 'bar',
              _attachments: {
                'message.txt': { follows: true, length: 18, content_type: 'text/plain' }
              }
            })
          },
          { body: 'I am an attachment' },
          {
            body: fs.createReadStream(path.resolve(__dirname, '../fixtures/test-path-schema.json'))
          }
        ]
      });

      expect(response).toEqual({ ok: true });
    });

    test('Should add the content type multipart related if is not set', async () => {
      nock('https://pets.com/v1', {
        reqheaders: {
          'content-type': /multipart\/related(.*)/g
        }
      })
        .post(
          '/policies',
          body =>
            body.includes('message.txt') &&
            body.includes('I am an attachment') &&
            // the attached file content
            body.includes('number of results to return, as sorted by increasing')
        )
        .reply(200, { ok: true });

      const template = {
        url: 'https://pets.com/v1/policies',
        method: 'POST',
        options: {
          preambleCRLF: true,
          postambleCRLF: true
        }
      };
      const dataSource = buildDataSource(template);
      // Multipart won't work directly on the datasource template, because of the parsing
      const compiled = dataSource({});
      const response = await compiled.request({
        multipart: [
          {
            'content-type': 'application/json',
            body: JSON.stringify({
              foo: 'bar',
              _attachments: {
                'message.txt': { follows: true, length: 18, content_type: 'text/plain' }
              }
            })
          },
          { body: 'I am an attachment' },
          {
            body: fs.createReadStream(path.resolve(__dirname, '../fixtures/test-path-schema.json'))
          }
        ]
      });

      expect(response).toEqual({ ok: true });
    });
  });

  describe('Form-data request', () => {
    test('Should allow a multipart/form-data request', async () => {
      nock('https://pets.com/v1')
        .post(
          '/policies',
          body =>
            body.includes('my_value') &&
            // the attached file content
            body.includes('number of results to return, as sorted by increasing')
        )
        .reply(200, { ok: true });

      const template = {
        url: 'https://pets.com/v1/policies',
        method: 'POST',
        options: {
          preambleCRLF: true,
          postambleCRLF: true
        }
      };
      const dataSource = buildDataSource(template);
      // Multipart won't work directly on the datasource template, because of the parsing
      const compiled = dataSource({});
      const response = await compiled.request({
        formData: {
          my_field: 'my_value',
          my_file: fs.createReadStream(path.resolve(__dirname, '../fixtures/test-path-schema.json'))
        }
      });

      expect(response).toEqual({ ok: true });
    });

    test('Should allow a multipart/form-data request with options and attachements', async () => {
      nock('https://pets.com/v1')
        .post(
          '/policies',
          body =>
            body.includes('my_value') &&
            // the attached file content
            body.includes('number of results to return, as sorted by increasing') &&
            body.includes('my-file.jpg') &&
            // test-datasource.json attachement
            body.includes('https://google.com/')
        )
        .reply(200, { ok: true });

      const template = {
        url: 'https://pets.com/v1/policies',
        method: 'POST',
        options: {
          preambleCRLF: true,
          postambleCRLF: true
        }
      };
      const dataSource = buildDataSource(template);
      // Multipart won't work directly on the datasource template, because of the parsing
      const compiled = dataSource({});
      const response = await compiled.request({
        formData: {
          my_field: 'my_value',
          custom_file: {
            value: fs.createReadStream(
              path.resolve(__dirname, '../fixtures/test-path-schema.json')
            ),
            options: {
              filename: 'my-file.jpg',
              contentType: 'image/jpeg'
            }
          },
          attachments: [
            fs.createReadStream(path.resolve(__dirname, '../fixtures/test-path-schema.json')),
            fs.createReadStream(path.resolve(__dirname, '../fixtures/test-datasource.json'))
          ]
        }
      });

      expect(response).toEqual({ ok: true });
    });
  });

  describe('Timeout parser, fullResponse and stric ssl features', () => {
    const originalHttpRequest = http.request;
    const originalHttpsRequest = https.request;
    let emmiter;
    beforeEach(() => {
      emmiter = new EventEmitter();
      Object.assign(emmiter, { end: () => {} });
    });
    afterEach(() => {
      http.request = originalHttpRequest;
      https.request = originalHttpsRequest;
      emmiter.removeAllListeners();
    });

    test('Should parse the timeout value to a number', done => {
      http.request = options => {
        expect(options.gotTimeout.request).toEqual(5000);
        done();

        return emmiter;
      };

      const template = {
        url: 'http://pets.com/v1/policies',
        method: 'GET',
        options: {
          timeout: '5000'
        }
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({});
      compiled.request();
    });

    test('Should set rejectUnauthorized as false by default', done => {
      http.request = options => {
        expect(options.agent.options.rejectUnauthorized).toEqual(false);
        done();

        return emmiter;
      };

      const template = {
        url: 'http://pets.com/v1/policies',
        method: 'GET',
        options: {
          timeout: '5000'
        }
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({});
      compiled.request();
    });

    test('Should allow to set the agent rejectUnauthorized as true', done => {
      http.request = options => {
        expect(options.agent.options.rejectUnauthorized).toEqual(true);
        done();

        return emmiter;
      };

      const template = {
        url: 'http://pets.com/v1/policies',
        method: 'GET',
        options: {
          timeout: '5000',
          rejectUnauthorized: true
        }
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({});
      compiled.request();
    });

    test('Should allow to set the agent certificates', done => {
      http.request = options => {
        expect(options.agent.options.cert).toEqual('132');
        expect(options.agent.options.key).toEqual('123');
        done();

        return emmiter;
      };

      const template = {
        url: 'http://pets.com/v1/policies',
        method: 'GET',
        options: {
          timeout: '5000',
          cert: '132',
          key: '123'
        }
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({});
      compiled.request();
    });

    test('Should allow get the full response object', async () => {
      const expectedBody = { ok: true };
      nock('https://pets.com')
        .get('/v1/policies')
        .reply(200, expectedBody);

      const template = {
        url: 'https://pets.com/v1/policies',
        method: 'GET',
        options: {
          resolveBodyOnly: false
        }
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({});
      const response = await compiled.request();

      expect(response.body).toEqual(expectedBody);
      expect(response.headers).toEqual({ 'content-type': 'application/json' });
    });

    test('Should allow get the full response object and should not be overrided by local assignament', async () => {
      const expectedBody = { ok: true };
      nock('https://pets.com')
        .get('/v1/policies')
        .reply(200, expectedBody);

      const template = {
        url: 'https://pets.com/v1/policies',
        method: 'GET',
        options: {
          resolveBodyOnly: false
        }
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({});
      const response = await compiled.request({ myCustomProp: true });

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
      const compiled = dataSource({});
      expect(() => compiled.request()).toThrowError(
        'URL is a mandatory parameter for a datasource request on operation: myads'
      );
    });

    test('Request parameters should override template fields', async () => {
      const expectedBody = { ok: true };
      nock('https://google.com')
        .get('/v1/policies')
        .reply(200, expectedBody);

      const template = {
        url: 'https://pets.com/v1/policies',
        method: 'GET'
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({});
      const response = await compiled.request({ url: 'https://google.com/v1/policies' });

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
        url: 'http://pets.com/v1/policies/{{ctx.req.id}}/documents',
        method: 'GET',
        options: {
          timeout: '5000'
        },
        json: {
          foo: '{{ctx.bar}} dead live & robots {{ctx.bar}}'
        }
      };
      const dataSource = buildDataSource(template);
      const {
        url,
        json: { foo }
      } = dataSource({ req: { id: 'toto' }, bar: 'bar' });

      expect(url).toEqual(expected.url);
      expect(foo).toEqual(expected.json.foo);
    });
  });

  describe('Datasource must reause an agent', () => {
    beforeEach(() => {
      createHttpAgent.mockClear();
      clearAgentStoreage();
      nock.cleanAll();
    });
    test('if same request is done the agent must be reused', async () => {
      nock('http://pets.com')
        .persist()
        .get('/v1/policies')
        .reply(200, { ok: true });

      const template = {
        id: 'op1',
        url: 'http://pets.com/v1/policies',
        method: 'GET'
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({});
      await compiled.request();
      await compiled.request();

      expect(createHttpAgent).toHaveBeenCalledTimes(1);
    });

    test('if same request is done with different agent options, agents can not be the same', async () => {
      nock('http://pets.com')
        .persist()
        .get('/v1/policies')
        .reply(200, { ok: true });

      const template = {
        id: 'op1',
        url: 'http://pets.com/v1/policies',
        method: 'GET'
      };
      const dataSource = buildDataSource(template);
      const compiled = dataSource({});
      await compiled.request();
      await compiled.request({
        keepAlive: false
      });

      expect(createHttpAgent).toHaveBeenCalledTimes(2);
    });
  });
});
