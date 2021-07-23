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
import { NormalizedOptions } from 'got';
import { utils } from '@bautajs/core';
import is from '@sindresorhus/is';
import { RestProviderOptions } from '../types';

const outgoingReqProto = Object.create(
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
    headers: {
      enumerable: true,
      writable: true,
      value: ''
    },
    body: {
      enumerable: true,
      writable: true,
      value: ''
    }
  }
);

function buildURL(url: URL) {
  return `${url.origin}${url.port ? `:${url.port}` : ''}${url.pathname}`;
}
/**
 * Source code https://github.com/pinojs/pino-std-serializers
 * Prepare the request object to be logged.
 *
 * @export
 * @param {NormalizedOptions} options
 * @returns
 */
export function reqSerializer(
  options: NormalizedOptions,
  isDebugLevel: boolean = false,
  restProviderOptions: RestProviderOptions
) {
  const req = Object.create(outgoingReqProto);
  if (options.url) {
    req.url = buildURL(options.url);
  }
  req.method = options.method;
  if (options.url.searchParams) {
    const entries = options.url.searchParams.entries();
    req.query = entries ? Object.fromEntries(entries) : undefined;
  }
  if (isDebugLevel === true) {
    if (options.headers) {
      req.headers = options.headers;
    }
    if (restProviderOptions.logRequestBody === true && (options.body || options.json)) {
      if (is.nodeStream(options.body)) {
        req.body = {
          file: {
            type: 'Stream'
          }
        };
      } else if (is.buffer(options.body)) {
        req.body = {
          file: {
            type: 'Buffer',
            byteLength: options.body.length
          }
        };
      } else {
        req.body = utils.prepareToLog(
          options.body || options.json,
          restProviderOptions.truncateBodyLogSize,
          restProviderOptions.disableBodyTruncateLog
        );
      }
    }
  }
  return req;
}
