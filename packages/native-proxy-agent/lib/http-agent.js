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
const http = require('http');

/**
 * A http agent implementation with proxy
 * @public
 * @class HttpAgent
 * @extends http.Agent
 * @param {Object} options - options to pass to the native http/s.Agent
 * @param {Object} [options.proxy] - overrides the proxy from the http/s_proxy env variables
 * @param {Object} [options.proxy.host] - proxy host
 * @param {Object} [options.proxy.port] - proxy port
 * @param {Object} [options.proxy.protocol] - proxy protocol, http, https...
 */
module.exports = class HttpAgent extends http.Agent {
  constructor(options) {
    if (options.proxy) {
      Object.assign(options, {
        port: options.proxy.port,
        host: options.proxy.host,
        httpThroughProxy: true,
        headers: options.proxy.headers || {}
      });

      if (options.proxy.auth) {
        const auth = Buffer.from(options.proxy.auth).toString('base64');
        Object.assign(options.headers, { 'Proxy-Authorization': `Basic ${auth}` });
      }
    }

    super(options);
  }
};
