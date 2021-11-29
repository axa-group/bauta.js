import { Response as GOTResponse } from 'got';
import is from '@sindresorhus/is';
import fastSafeStringify from 'fast-safe-stringify';
import { RestProviderOptions } from '../types';
import { DEFAULT_MAX_BODY_LOG_SIZE } from '../constants';

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
  restProviderOptions: RestProviderOptions,
  isDebugMode: boolean = false
) {
  const res = Object.create(outgoingResProto);
  res.responseTime = response.timings?.phases.total;
  res.statusCode = response.statusCode;

  if (isDebugMode === true) {
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
      } else {
        const bodyString =
          typeof response.body === 'object'
            ? fastSafeStringify(response.body)
            : (response.body as string) || '';
        const size = Buffer.byteLength(bodyString);
        const maxSize = restProviderOptions.maxBodyLogSize || DEFAULT_MAX_BODY_LOG_SIZE;
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
