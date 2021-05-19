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

const rawSymbol = Symbol('pino-raw-req-ref');
const pinoReqProto = Object.create(
  {},
  {
    method: {
      enumerable: true,
      writable: true,
      value: ''
    },
    url: {
      enumerable: true,
      writable: true,
      value: ''
    },
    query: {
      enumerable: true,
      writable: true,
      value: ''
    },
    params: {
      enumerable: true,
      writable: true,
      value: ''
    },
    remoteAddress: {
      enumerable: true,
      writable: true,
      value: ''
    },
    remotePort: {
      enumerable: true,
      writable: true,
      value: ''
    },
    raw: {
      enumerable: false,
      get() {
        return this[rawSymbol];
      },
      set(val) {
        this[rawSymbol] = val;
      }
    }
  }
);
Object.defineProperty(pinoReqProto, rawSymbol, {
  writable: true,
  value: {}
});

/**
 * Source code https://github.com/pinojs/pino-std-serializers
 * We need to remove the query params from the url log and set it as an object, also we don't want to
 * log the headers.
 * @export
 * @param {*} req
 * @returns
 */
export function reqSerializer(req: any) {
  const connection = req.socket;
  const requestSerialized = Object.create(pinoReqProto);
  requestSerialized.method = req.method;

  if (req.originalUrl) {
    [requestSerialized.url] = req.originalUrl.split('?');
  } else {
    const reqUrl = req.path || (req.url ? req.url : undefined);
    requestSerialized.url = reqUrl?.split('?')[0];
  }

  requestSerialized.query = req.raw?.query;
  requestSerialized.params = req.raw?.params;
  requestSerialized.remoteAddress = connection && connection.remoteAddress;
  requestSerialized.remotePort = connection && connection.remotePort;
  requestSerialized.raw = req.raw || req;
  return requestSerialized;
}
