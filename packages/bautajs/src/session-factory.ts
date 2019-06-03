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
import fastSafeStringify from 'fast-safe-stringify';
import { LoggerBuilder } from './logger';
import { Session } from './utils/types';

const maxInt = 2147483647;
const requestIdHeader = 'request-id';
let nextReqId = 0;

function genReqId(headers: any): string {
  // eslint-disable-next-line no-bitwise
  nextReqId = (nextReqId + 1) & maxInt;
  return headers && headers[requestIdHeader] ? String(headers[requestIdHeader]) : String(nextReqId);
}

/**
 * @ignore
 * Build a session id from the given req id and authorization token, that will be available a cross the operation chain
 */
export function sessionFactory(req: any): Session {
  const { headers } = req;
  const loggerContext: {
    id: string;
    userId?: string;
    url: string | undefined;
  } = {
    id: !req.id ? genReqId(headers) : req.id,
    url: req.url
  };

  if (headers && headers.authorization) {
    loggerContext.userId = headers.authorization.substring(headers.authorization.length - 6);
  }

  return {
    ...loggerContext,
    logger: LoggerBuilder.create(fastSafeStringify(loggerContext))
  };
}

export default sessionFactory;
