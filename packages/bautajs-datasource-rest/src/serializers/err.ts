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
import { RequestError } from 'got';
import is from '@sindresorhus/is';
import fastSafeStringify from 'fast-safe-stringify';
import { RestProviderOptions } from '../types';
import { DEFAULT_MAX_BODY_LOG_SIZE } from '../constants';

const outgoingErrProto = Object.create(
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
    },
    name: {
      enumerable: true,
      writable: true,
      value: ''
    },
    code: {
      enumerable: true,
      writable: true,
      value: ''
    },
    message: {
      enumerable: true,
      writable: true,
      value: ''
    }
  }
);
/**
 * Source code https://github.com/pinojs/pino-std-serializers
 * Prepare the err response object to be logged
 *
 * @export
 * @param {RequestError} error
 * @returns
 */
export function errSerializer(
  error: RequestError,
  restProviderOptions: RestProviderOptions,
  isDebugMode: boolean = false
) {
  const err = Object.create(outgoingErrProto);
  err.responseTime = error.response?.timings?.phases.total;
  err.statusCode = error.response?.statusCode;
  err.code = error.code;
  err.message = error.message;
  err.name = error.name;
  if (isDebugMode === true) {
    if (error.response?.headers) {
      err.headers = error.response.headers;
    }
  }

  if (error.response?.body) {
    if (is.nodeStream(error.response.body)) {
      err.body = {
        file: {
          type: 'Stream'
        }
      };
    } else if (is.buffer(error.response.body)) {
      err.body = {
        file: {
          type: 'Buffer',
          byteLength: error.response.body.length
        }
      };
    } else {
      const bodyString =
        typeof error.response.body === 'object'
          ? fastSafeStringify(error.response.body)
          : (error.response.body as string) || '';
      const size = Buffer.byteLength(bodyString);
      const maxSize = restProviderOptions.maxBodyLogSize || DEFAULT_MAX_BODY_LOG_SIZE;
      if (size > maxSize) {
        err.body = {
          reason: `Body exceeds the limit of ${maxSize} bytes.`,
          type: 'JSON',
          byteLength: size
        };
      } else {
        err.body = bodyString;
      }
    }
  }
  return err;
}
