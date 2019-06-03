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
import Events from 'events';
import got from 'got';
import http from 'http';
import https from 'https';
import { createAgent } from '../index';

describe('Agent test', () => {
  describe('Proxy env variables', () => {
    const originalHttpRequest = http.request;
    const originalHttpsRequest = https.request;
    let emmiter: Events;
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
      http.request = (options: any) => {
        expect(options.agent.options.host).toEqual(host);
        expect(options.agent.options.port).toEqual(port);
        done();

        return emmiter;
      };
      const url = 'http://axa.com/v1/cats';
      const agent = createAgent(url);
      const options = {
        agent,
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      got(url, options);
    });

    test('should support the HTTP_PROXY variable', done => {
      const host = '192.168.1.6';
      const port = '3128';
      process.env.HTTP_PROXY = `http://${host}:${port}`;

      // @ts-ignore
      http.request = (options: any) => {
        expect(options.agent.options.host).toEqual(host);
        expect(options.agent.options.port).toEqual(port);
        done();

        return emmiter;
      };

      const url = 'http://axa.com/v1/cats';
      const agent = createAgent(url);
      const options = {
        agent,
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      got(url, options);
    });

    test('should support not using proxy', done => {
      const host = 'axa.com';

      // @ts-ignore
      http.request = (options: any) => {
        expect(options.agent.options.host).toBeUndefined();
        expect(options.host).toEqual(host);
        done();

        return emmiter;
      };

      const url = `http://${host}/v1/cats`;
      const agent = createAgent(url);
      const options = {
        agent,
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      got(url, options);
    });

    test('should support the http_proxy with authentication', done => {
      const host = '192.168.1.6';
      const port = 3128;
      const auth = 'user:passord';

      // @ts-ignore
      http.request = (options: any) => {
        expect(options.agent.options.host).toEqual(host);
        expect(options.agent.options.port).toEqual(port);
        expect(options.agent.options.headers['Proxy-Authorization']).toEqual(
          `Basic ${Buffer.from(auth).toString('base64')}`
        );
        done();

        return emmiter;
      };

      const url = `http://${host}/v1/cats`;
      const agent = createAgent(url, {
        proxy: {
          host,
          port,
          auth
        }
      });
      const options = {
        agent,
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      got(url, options);
    });

    test('should support https request throught a http proxy', done => {
      const host = '192.168.1.6';
      const port = '3128';
      process.env.HTTP_PROXY = `http://${host}:${port}`;

      // @ts-ignore
      https.request = (options: any) => {
        expect(options.agent.options.proxy.host).toEqual(host);
        expect(options.agent.options.proxy.port).toEqual(port);

        done();

        return emmiter;
      };

      const url = `https://axa.com/v1/cats`;
      const agent = createAgent(url);
      const options = {
        agent,
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      got(url, options);
    });

    test('should support the HTTPS_PROXY variable and tunneling https proxy to http request', done => {
      const host = '192.168.1.7';
      const port = '3128';
      process.env.HTTPS_PROXY = `https://${host}:${port}`;

      // @ts-ignore
      http.request = (options: any) => {
        expect(options.agent.options.host).toEqual(host);
        expect(options.agent.options.port).toEqual(port);
        done();

        return emmiter;
      };

      const url = `http://axa.com/v1/cats`;
      const agent = createAgent(url);
      const options = {
        agent,
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      got(url, options);
    });

    test('should support the HTTP_PROXY variable and tunneling https proxy to http request', done => {
      const host = '192.168.1.8';
      const port = '3128';
      process.env.HTTP_PROXY = `https://${host}:${port}`;

      // @ts-ignore
      http.request = (options: any) => {
        expect(options.agent.options.host).toEqual(host);
        expect(options.agent.options.port).toEqual(port);
        done();

        return emmiter;
      };

      const url = `http://axa.com/v1/cats`;
      const agent = createAgent(url);
      const options = {
        agent,
        method: 'POST',
        options: {
          form: {
            field1: 'value'
          }
        }
      };
      got(url, options);
    });
  });
});
