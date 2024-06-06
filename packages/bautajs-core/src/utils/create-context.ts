import { RawData, Logger, RawContext } from '../types.js';
import { CancelableTokenBuilder } from '../core/cancelable-token.js';
import { idGenerator } from './request-id-generator.js';
import { defaultLogger } from '../default-logger.js';
/**
 * Create a BautaJS context object. Useful for doing testing.
 *
 * @export
 * @template TRequest
 * @template TResponse
 * @template TRaw
 * @param {RawData<TRaw>} ctx
 * @param {Logger} [logger=defaultLogger('@axa/bautajs-core')]
 * @returns {Context}
 */
export function createContext<TRaw>(
  raw: RawData<TRaw>,
  logger: Logger = defaultLogger('@axa/bautajs-core')
): RawContext<TRaw> {
  const token = new CancelableTokenBuilder();
  const id = !raw.id ? idGenerator() : raw.id;
  let ctxLogger: Logger;
  if (!raw.log) {
    ctxLogger = logger.child({
      reqId: raw.id
    });
  } else {
    ctxLogger = raw.log;
  }

  return Object.create(Object.prototype, {
    id: {
      value: id,
      enumerable: true,
      configurable: false,
      writable: false
    },
    validateRequestSchema: {
      value: () => null,
      enumerable: true,
      configurable: true,
      writable: true
    },
    validateResponseSchema: {
      value: () => null,
      enumerable: true,
      configurable: true,
      writable: true
    },
    data: {
      value: raw.data || {},
      enumerable: true,
      configurable: true,
      writable: true
    },
    token: {
      value: token,
      enumerable: true,
      configurable: false,
      writable: false
    },
    log: {
      value: ctxLogger,
      enumerable: true,
      configurable: false,
      writable: false
    },
    raw: {
      value: raw,
      enumerable: false,
      configurable: false,
      writable: false
    }
  });
}

export default createContext;
