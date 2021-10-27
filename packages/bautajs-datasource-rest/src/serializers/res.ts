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
import { Response as GOTResponse } from 'got';
import { utils } from '@bautajs/core';
import is from '@sindresorhus/is';
import fastSafeStringify from 'fast-safe-stringify';
import { RestProviderOptions } from '../types';

const outgoingResProto = Object.create(
  {},
  {
    responseTime: {
      enumerable: true,
      writable: true,
      value: ''
    },
    statusCode: {
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
/**
 * Source code https://github.com/pinojs/pino-std-serializers
 * Prepare the response object to be logged.
 *
 * @export
 * @param {GOTResponse} response
 * @returns
 */
export function resSerializer(
  response: GOTResponse,
  isDebugLevel: boolean = false,
  restProviderOptions: RestProviderOptions
) {
  const res = Object.create(outgoingResProto);
  res.responseTime = response.timings?.phases.total;
  res.statusCode = response.statusCode;

  if (isDebugLevel === true) {
    if (response.headers) {
      res.headers = response.headers;
    }
    if (response.body) {
      if (is.nodeStream(response.body)) {
        res.body = {
          file: {
            type: 'Stream'
          }
        };
      } else if (is.buffer(response.body)) {
        res.body = {
          file: {
            type: 'Buffer',
            byteLength: response.body.length
          }
        };
      } else if (
        // deprecate option
        restProviderOptions.truncateBodyLogSize ||
        restProviderOptions.disableBodyTruncateLog
      ) {
        res.body = utils.prepareToLog(
          response.body,
          restProviderOptions.truncateBodyLogSize,
          restProviderOptions.disableBodyTruncateLog
        );
      } else {
        const bodyString =
          typeof response.body === 'object'
            ? fastSafeStringify(response.body)
            : (response.body as string) || '';
        const size = Buffer.byteLength(bodyString);
        const maxSize = restProviderOptions.maxBodyLogSize || 1024;
        if (size > maxSize) {
          res.body = {
            reason: `Body exceeds the limit of ${maxSize} bytes.`,
            type: 'JSON',
            byteLength: size
          };
        } else {
          res.body = bodyString;
        }
      }
    }
  }
  return res;
}
