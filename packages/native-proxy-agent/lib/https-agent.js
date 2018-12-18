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
const https = require('https');
const net = require('net');
const tls = require('tls');

/**
 * A https agent implementation with proxy
 * @public
 * @class HttpsAgent
 * @extends https.Agent
 * @param {Object} options - options to pass to the native http/s.Agent
 * @param {Object} [options.proxy] - overrides the proxy from the http/s_proxy env variables
 * @param {Object} [options.proxy.host] - proxy host
 * @param {Object} [options.proxy.port] - proxy port
 * @param {Object} [options.proxy.protocol] - proxy protocol, http, https...
 */
module.exports = class HttpsAgent extends https.Agent {
  createConnectionHttpsAfterHttp(options, cb) {
    let socket;
    if (options.proxy.protocol === 'https') {
      socket = tls.connect(options.proxy);
    } else {
      socket = net.connect(options.proxy);
      socket.setKeepAlive(true);
    }

    const onError = error => {
      socket.destroy();
      cb(error);
    };
    const onData = data => {
      socket.removeListener('error', onError);
      const m = data.toString().match(/^HTTP\/1.1 (\d*)/);
      if (m[1] !== '200') {
        socket.destroy();
        return cb(new Error(m[0]));
      }
      Object.assign(options, { socket });
      return cb(null, super.createConnection(options));
    };
    socket.once('error', onError);
    socket.once('data', onData);

    let msg = `CONNECT ${options.hostname}:${options.port} HTTP/1.1\r\n`;
    if (options.proxy.auth) {
      const auth = Buffer.from(options.proxy.auth).toString('base64');
      msg += `Proxy-Authorization: Basic ${auth}\r\n`;
    }
    if (options.proxy.headers) {
      Object.keys(options.proxy.headers).forEach(header => {
        msg += `${header}: ${options.proxy.headers[header]}\r\n`;
      });
    }
    msg += `Host: ${options.hostname}:${options.port} \r\n`;
    msg += '\r\n';
    socket.write(msg);
  }

  createConnection(options, cb) {
    if (options.proxy) {
      this.createConnectionHttpsAfterHttp(options, cb);
    } else {
      cb(null, super.createConnection(options));
    }
  }
};
