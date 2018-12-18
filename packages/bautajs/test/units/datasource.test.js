/*
 * Copyright (c) 2018 AXA Shared Services Spain S.A.
 *
 * Licensed under the MyAXA inner-source License (the "License");
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
const nock = require('nock');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const EventEmitter = require('events');
const createDataSource = require('../../lib/request/datasource');

describe('datasource test', () => {
  describe('Request alias features', () => {
    afterEach(() => {
      nock.cleanAll();
    });
    test('should allow a request with application/json header using the field json as an object', async () => {
      const expected = { bender: 'ok' };
      nock('https://axa.com')
        .post('/v1/policies', '{"field1":"value"}')
        .reply(200, expected);

      const template = {
        url: 'https://axa.com/v1/policies',
        method: 'POST',
        options: {
          json: {
            field1: 'value'
          }
        }
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({});
      const response = await compiled.request();

      expect(response).toEqual(expected);
    });

    test('should allow a request with application/x-www-form-urlencoded using the field form as an object', async () => {
      const expected = { bender: 'ok' };
      nock('https://axa.com', {
        reqheaders: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      })
        .post('/v1/policies', {
          field1: 'value'
        })
        .reply(200, expected);

      const template = {
        url: 'https://axa.com/v1/policies',
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({});
      const response = await compiled.request();
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
        headers:
          '{"user-agent":"got/9.3.1 (https://github.com/sindresorhus/got)","connection":"keep-alive","accept":"application/json","accept-encoding":"gzip, deflate","content-type":"application/json","content-length":19}',
        method: 'GET',
        url: 'https://axa.com/v1/policies',
        body: '{"password":"1234"}'
      };

      nock('https://axa.com')
        .get('/v1/policies')
        .reply(200, { bender: 'ok' });

      const template = {
        url: 'https://axa.com/v1/policies',
        method: 'GET',
        options: {
          json: {
            password: '1234'
          }
        }
      };
      const debugLogs = [];
      const logger = {
        debug(...params) {
          debugLogs.push(params);
        },
        info() {},
        warn() {}
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({ logger });
      await compiled.request();

      expect(debugLogs[0][0]).toEqual(expectedMsg);
      expect(debugLogs[0][1]).toEqual(expectedData);
    });

    test('should log the requests method and url info mode', async () => {
      process.env.LOG_LEVEL = 'info';
      const expectedMsg = 'request-logger: Request to [POST] https://axa.com/v1/policies';

      nock('https://axa.com')
        .post('/v1/policies', {
          field1: 'value'
        })
        .reply(200, { bender: 'ok' });

      const template = {
        url: 'https://axa.com/v1/policies',
        method: 'POST',
        options: {
          json: {
            field1: 'value'
          }
        }
      };
      const infoLogs = [];
      const logger = {
        info: (...params) => {
          infoLogs.push(params);
        },
        debug() {},
        warn() {}
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({ logger });
      await compiled.request();
      expect(infoLogs[0][0]).toEqual(expectedMsg);
    });

    test('should log the requests data on debug mode if the request body is not a json', async () => {
      process.env.LOG_LEVEL = 'debug';
      const expectedMsg = 'request-logger: Request data: ';
      const expectedData = {
        headers:
          '{"user-agent":"got/9.3.1 (https://github.com/sindresorhus/got)","accept":"application/json","connection":"keep-alive","accept-encoding":"gzip, deflate","content-length":10}',
        method: 'GET',
        url: 'https://axa.com/v1/policies',
        body: 'someString'
      };

      nock('https://axa.com')
        .get('/v1/policies')
        .reply(200, { bender: 'ok' });

      const template = {
        url: 'https://axa.com/v1/policies',
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
      const logger = {
        debug(...params) {
          debugLogs.push(params);
        },
        info() {},
        warn() {}
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({ logger });
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
        'request-logger: Response for [undefined]  https://axa.com/v1/policies: ',
        { body: '{"bender":1}', headers: '{"content-type":"application/json"}', statusCode: 200 }
      ];

      nock('https://axa.com/v1')
        .get('/policies')
        .reply(200, { bender: 1 });

      const template = {
        url: 'https://axa.com/v1/policies',
        method: 'GET'
      };
      const debugConsole = [];
      const infoConsole = [];
      const logger = {
        debug: (...params) => {
          debugConsole.push(params);
        },
        info: (...params) => {
          infoConsole.push(params);
        },
        warn() {}
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({ logger });
      await compiled.request();
      expect(debugConsole[1]).toEqual(expectedMsg);
    });

    test('should log the response time', async () => {
      process.env.LOG_LEVEL = 'info';
      const expectedMsg = new RegExp(
        'request-logger: The request to https://axa.com/v1/policies taked: (.*) ms'
      );

      nock('https://axa.com/v1')
        .get('/policies')
        .reply(200, { bender: 1 });

      const template = {
        url: 'https://axa.com/v1/policies',
        method: 'GET'
      };
      const infoConsole = [];
      const logger = {
        info: (...params) => {
          infoConsole.push(params);
        }
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({ logger });
      await compiled.request();
      expect(infoConsole[1][0]).toMatch(expectedMsg);
    });

    test('should not crash if the response body could not be parsed', async () => {
      process.env.LOG_LEVEL = 'debug';
      // With nock got is not able to get the response method, doing a normal request this field is returned
      const expectedMsg = [
        'request-logger: Response for [undefined]  https://axa.com/v1/policies: ',
        {
          body: '<html><div></div></html>',
          headers: '{"content-type":"text/html"}',
          statusCode: 200
        }
      ];

      nock('https://axa.com/v1')
        .get('/policies')
        .reply(200, '<html><div></div></html>', {
          'content-type': 'text/html'
        });

      const template = {
        url: 'https://axa.com/v1/policies',
        method: 'GET',
        options: {
          json: false
        }
      };
      const debugConsole = [];
      const infoConsole = [];
      const logger = {
        debug: (...params) => {
          debugConsole.push(params);
        },
        info: (...params) => {
          infoConsole.push(params);
        },
        warn() {}
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({ logger });
      await compiled.request();
      expect(debugConsole[1]).toEqual(expectedMsg);
    });
  });

  describe('Proxy env variables', () => {
    const originalHttpRequest = http.request;
    const originalHttpsRequest = https.request;
    let emmiter;
    beforeEach(() => {
      process.env.http_proxy = '';
      process.env.https_proxy = '';
      process.env.HTTP_PROXY = '';
      process.env.HTTPS_PROXY = '';
      emmiter = new EventEmitter();
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

      http.request = options => {
        expect(options.agent.options.host).toEqual(host);
        expect(options.agent.options.port).toEqual(port);
        done();

        return emmiter;
      };

      const template = {
        url: 'http://axa.com/v1/policies',
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({});
      compiled.request();
    });

    test('should support the HTTP_PROXY variable', done => {
      const host = '192.168.1.6';
      const port = '3128';
      process.env.HTTP_PROXY = `http://${host}:${port}`;

      http.request = options => {
        expect(options.agent.options.host).toEqual(host);
        expect(options.agent.options.port).toEqual(port);
        done();

        return emmiter;
      };

      const template = {
        url: 'http://axa.com/v1/policies',
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({});
      compiled.request();
    });

    test('should support not using proxy', done => {
      const host = 'axa.com';

      http.request = options => {
        expect(options.agent.options.host).toBeUndefined();
        expect(options.host).toEqual(host);
        done();

        return emmiter;
      };

      const template = {
        url: `http://${host}/v1/policies`,
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({});
      compiled.request();
    });

    test('should support the http_proxy with authentication', done => {
      const host = '192.168.1.6';
      const port = '3128';
      const auth = 'user:passord';

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
        url: 'http://axa.com/v1/policies',
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
      const dataSource = createDataSource(template);
      const compiled = dataSource({});
      compiled.request();
    });

    test('should support https request throught a http proxy', done => {
      const host = '192.168.1.6';
      const port = '3128';
      process.env.HTTP_PROXY = `http://${host}:${port}`;

      https.request = options => {
        expect(options.agent.options.proxy.host).toEqual(host);
        expect(options.agent.options.proxy.port).toEqual(port);

        done();

        return emmiter;
      };

      const template = {
        url: 'https://axa.com/v1/policies',
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({});
      compiled.request();
    });

    test('should support the HTTPS_PROXY variable and tunneling https proxy to http request', done => {
      const host = '192.168.1.7';
      const port = '3128';
      process.env.HTTPS_PROXY = `https://${host}:${port}`;

      http.request = options => {
        expect(options.agent.options.host).toEqual(host);
        expect(options.agent.options.port).toEqual(port);
        done();

        return emmiter;
      };

      const template = {
        url: 'http://axa.com/v1/policies',
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({});
      compiled.request();
    });

    test('should support the HTTP_PROXY variable and tunneling https proxy to http request', done => {
      const host = '192.168.1.8';
      const port = '3128';
      process.env.HTTP_PROXY = `https://${host}:${port}`;

      http.request = options => {
        expect(options.agent.options.host).toEqual(host);
        expect(options.agent.options.port).toEqual(port);
        done();

        return emmiter;
      };

      const template = {
        url: 'http://axa.com/v1/policies',
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({});
      compiled.request();
    });
  });

  describe('Multipart request', () => {
    test('Should build a new multipart request if the multipart options is set', async () => {
      nock('https://axa.com/v1')
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
        url: 'https://axa.com/v1/policies',
        method: 'POST',
        options: {
          headers: {
            'content-type': 'multipart/related'
          },
          preambleCRLF: true,
          postambleCRLF: true
        }
      };
      const dataSource = createDataSource(template);
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
            { body: fs.createReadStream(path.resolve(__dirname, '../fixtures/test-schema.json')) }
          ]
        }
      });

      expect(response).toEqual({ ok: true });
    });

    test('Should build a new multipart request if multipart do not have data object', async () => {
      nock('https://axa.com/v1')
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
        url: 'https://axa.com/v1/policies',
        method: 'POST',
        options: {
          headers: {
            'content-type': 'multipart/related'
          },
          preambleCRLF: true,
          postambleCRLF: true
        }
      };
      const dataSource = createDataSource(template);
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
          { body: fs.createReadStream(path.resolve(__dirname, '../fixtures/test-schema.json')) }
        ]
      });

      expect(response).toEqual({ ok: true });
    });

    test('Should add the content type multipart related if is not set', async () => {
      nock('https://axa.com/v1', {
        reqheaders(headers) {
          return headers['content-type'].includes('multipart/related');
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
        url: 'https://axa.com/v1/policies',
        method: 'POST',
        options: {
          preambleCRLF: true,
          postambleCRLF: true
        }
      };
      const dataSource = createDataSource(template);
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
          { body: fs.createReadStream(path.resolve(__dirname, '../fixtures/test-schema.json')) }
        ]
      });

      expect(response).toEqual({ ok: true });
    });
  });

  describe('Form-data request', () => {
    test('Should allow a multipart/form-data request', async () => {
      nock('https://axa.com/v1')
        .post(
          '/policies',
          body =>
            body.includes('my_value') &&
            // the attached file content
            body.includes('number of results to return, as sorted by increasing')
        )
        .reply(200, { ok: true });

      const template = {
        url: 'https://axa.com/v1/policies',
        method: 'POST',
        options: {
          preambleCRLF: true,
          postambleCRLF: true
        }
      };
      const dataSource = createDataSource(template);
      // Multipart won't work directly on the datasource template, because of the parsing
      const compiled = dataSource({});
      const response = await compiled.request({
        formData: {
          my_field: 'my_value',
          my_file: fs.createReadStream(path.resolve(__dirname, '../fixtures/test-schema.json'))
        }
      });

      expect(response).toEqual({ ok: true });
    });

    test('Should allow a multipart/form-data request with options and attachements', async () => {
      nock('https://axa.com/v1')
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
        url: 'https://axa.com/v1/policies',
        method: 'POST',
        options: {
          preambleCRLF: true,
          postambleCRLF: true
        }
      };
      const dataSource = createDataSource(template);
      // Multipart won't work directly on the datasource template, because of the parsing
      const compiled = dataSource({});
      const response = await compiled.request({
        formData: {
          my_field: 'my_value',
          custom_file: {
            value: fs.createReadStream(path.resolve(__dirname, '../fixtures/test-schema.json')),
            options: {
              filename: 'my-file.jpg',
              contentType: 'image/jpeg'
            }
          },
          attachments: [
            fs.createReadStream(path.resolve(__dirname, '../fixtures/test-schema.json')),
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
        url: 'http://axa.com/v1/policies',
        method: 'GET',
        options: {
          timeout: '5000'
        }
      };
      const dataSource = createDataSource(template);
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
        url: 'http://axa.com/v1/policies',
        method: 'GET',
        options: {
          timeout: '5000'
        }
      };
      const dataSource = createDataSource(template);
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
        url: 'http://axa.com/v1/policies',
        method: 'GET',
        options: {
          timeout: '5000',
          rejectUnauthorized: true
        }
      };
      const dataSource = createDataSource(template);
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
        url: 'http://axa.com/v1/policies',
        method: 'GET',
        options: {
          timeout: '5000',
          cert: '132',
          key: '123'
        }
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({});
      compiled.request();
    });

    test('Should allow get the full response object', async () => {
      const expectedBody = { ok: true };
      nock('https://axa.com')
        .get('/v1/policies')
        .reply(200, expectedBody);

      const template = {
        url: 'https://axa.com/v1/policies',
        method: 'GET',
        fullResponse: true
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({});
      const response = await compiled.request();

      expect(response.body).toEqual(expectedBody);
      expect(response.headers).toEqual({ 'content-type': 'application/json' });
    });

    test('Should throw an error if a request is done without url', async () => {
      const template = {
        name: 'myads',
        method: 'GET',
        fullResponse: true
      };
      const dataSource = createDataSource(template);
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
        url: 'https://axa.com/v1/policies',
        method: 'GET'
      };
      const dataSource = createDataSource(template);
      const compiled = dataSource({});
      const response = await compiled.request({ url: 'https://google.com/v1/policies' });

      expect(response).toEqual(expectedBody);
    });
  });
});
