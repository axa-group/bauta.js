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
import { RawData, Logger, RawContext } from '../types';
import { CancelableTokenBuilder } from '../core/cancelable-token';
import { idGenerator } from './request-id-generator';
import { defaultLogger } from '../default-logger';
/**
 * Create a BautaJS context object. Useful for doing testing.
 *
 * @export
 * @template TRequest
 * @template TResponse
 * @template TRaw
 * @param {RawData<TRaw>} ctx
 * @param {Logger} [logger=defaultLogger('@bautajs/core')]
 * @returns {Context}
 */
export function createContext<TRaw>(
  raw: RawData<TRaw>,
  logger: Logger = defaultLogger('@bautajs/core')
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
