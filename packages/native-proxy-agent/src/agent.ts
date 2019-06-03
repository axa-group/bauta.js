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
import { URL } from 'url';
import { HttpAgent } from './http-agent';
import { HttpsAgent } from './https-agent';
import { NativeAgentOptions } from './types';

/**
 * Get the needed proxy agent depending of the given proxy options and target.
 * Also try to gets the proxy from the http/s_proxy env variables
 * @param {string} target - The target to proxy
 * @param {NativeAgentOptions} [options]
 * @returns {HttpsAgent|HttpAgent} The agent depending on the target.
 * @example
 * const { createAgent } = require('native-proxy-agent');
 * const got = require('got');
 *
 * got('http://myhost.com', { agent : createAgent('http://myhost.com') });
 *
 */
export function createAgent(
  target: string,
  options: NativeAgentOptions = {}
): HttpsAgent | HttpAgent {
  if (options.proxy === undefined) {
    const { http_proxy: httpProxy, https_proxy: httpsProxy, HTTP_PROXY, HTTPS_PROXY } = process.env;
    const proxy: string = httpsProxy || HTTPS_PROXY || httpProxy || HTTP_PROXY || '';
    const u: URL | string = proxy && new URL(proxy);
    if (u) {
      Object.assign(options, {
        proxy: {
          host: (u as URL).hostname,
          port: (u as URL).port,
          protocol: (u as URL).protocol
        }
      });
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

export default createAgent;
