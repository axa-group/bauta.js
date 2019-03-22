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
const { URL } = require('url');
const HttpsAgent = require('./lib/https-agent');
const HttpAgent = require('./lib/http-agent');

/**
 * Get the needed proxy agent depending of the given proxy options and target.
 * Also try to gets the proxy from the http/s_proxy env variables
 * @param {string} target - The target to proxy
 * @param {Object} [options] - options to pass to the native http/s.Agent
 * @param {Object} [options.proxy] - overrides the proxy from the http/s_proxy env variables
 * @param {Object} [options.proxy.host] - proxy host
 * @param {Object} [options.proxy.port] - proxy port
 * @param {Object} [options.proxy.protocol] - proxy protocol, http, https...
 * @returns {HttpsAgent|HttpAgent} The agent depending on the target.
 */
function createAgent(target, options = {}) {
  if (options.proxy === undefined) {
    const { http_proxy: httpProxy, https_proxy: httpsProxy, HTTP_PROXY, HTTPS_PROXY } = process.env;
    const proxy = httpsProxy || HTTPS_PROXY || httpProxy || HTTP_PROXY || '';
    const u = proxy && new URL(proxy);
    if (u) {
      Object.assign(options, { proxy: { host: u.hostname, port: u.port, protocol: u.protocol } });
    }
  }
  if (options.keepAlive === null || options.keepAlive === undefined) {
    Object.assign(options, { keepAlive: true });
  }
  Object.assign(options, { target });
  if (target.toLowerCase().indexOf('https:') === 0) {
    return new HttpsAgent(options);
  }

  return new HttpAgent(options);
}

module.exports = createAgent;
