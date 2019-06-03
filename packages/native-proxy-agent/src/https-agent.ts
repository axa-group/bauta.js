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
import * as https from 'https';
import * as net from 'net';
import * as tls from 'tls';
import { HttpProxy, HttpsProxy, ICallback, NativeHttpsAgentOptions } from './types';

export class HttpsAgent extends https.Agent {
  private createConnectionHttpsAfterHttp(options: NativeHttpsAgentOptions, cb: ICallback) {
    let socket: tls.TLSSocket | net.Socket;
    if ((options.proxy as HttpProxy | HttpsProxy).protocol === 'https') {
      socket = tls.connect(options.proxy as HttpsProxy);
    } else {
      socket = net.connect(options.proxy as HttpProxy);
      socket.setKeepAlive(true);
    }

    const onError = (error: Error) => {
      socket.destroy();
      cb(error);
    };
    const onData = (data: Buffer) => {
      socket.removeListener('error', onError);
      const m: RegExpMatchArray | null = data.toString().match(/^HTTP\/1.1 (\d*)/);
      if (m && m[1] !== '200') {
        socket.destroy();
        return cb(new Error(m[0]));
      }
      Object.assign(options, { socket });

      // @ts-ignore
      return cb(null, super.createConnection(options));
    };
    socket.once('error', onError);
    socket.once('data', onData);

    let msg = `CONNECT ${options.hostname}:${options.port} HTTP/1.1\r\n`;
    if ((options.proxy as HttpProxy | HttpsProxy).auth) {
      const auth = Buffer.from((options.proxy as HttpProxy | HttpsProxy).auth).toString('base64');
      msg += `Proxy-Authorization: Basic ${auth}\r\n`;
    }
    if ((options.proxy as HttpProxy | HttpsProxy).headers) {
      Object.keys((options.proxy as HttpProxy | HttpsProxy).headers).forEach(header => {
        msg += `${header}: ${(options.proxy as HttpProxy | HttpsProxy).headers[header]}\r\n`;
      });
    }
    msg += `Host: ${options.hostname}:${options.port} \r\n`;
    msg += '\r\n';
    socket.write(msg);
  }

  createConnection(options: NativeHttpsAgentOptions, cb: ICallback) {
    if (options.proxy) {
      this.createConnectionHttpsAfterHttp(options, cb);
    } else {
      // @ts-ignore
      cb(null, super.createConnection(options));
    }
  }
}

export default HttpsAgent;
