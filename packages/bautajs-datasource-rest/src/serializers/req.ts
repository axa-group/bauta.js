import { NormalizedOptions } from 'got';
import is from '@sindresorhus/is';
import fastSafeStringify from 'fast-safe-stringify';
import { RestProviderOptions } from '../types';
import { DEFAULT_MAX_BODY_LOG_SIZE } from '../constants';

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
  return `${url.origin}${url.pathname}`;
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
  restProviderOptions: RestProviderOptions,
  isDebugMode: boolean = false
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
  if (isDebugMode === true) {
    if (options.headers) {
      req.headers = options.headers;
    }
    if (options.body || options.json) {
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
        const body = options.body || options.json || '';
        const bodyString = typeof body === 'object' ? fastSafeStringify(body) : body;
        const size = Buffer.byteLength(bodyString);
        const maxSize = restProviderOptions.maxBodyLogSize || DEFAULT_MAX_BODY_LOG_SIZE;
        if (size > maxSize) {
          req.body = {
            reason: `Body exceeds the limit of ${maxSize} bytes.`,
            type: 'JSON',
            byteLength: size
          };
        } else {
          req.body = bodyString;
        }
      }
    }
  }
  return req;
}
