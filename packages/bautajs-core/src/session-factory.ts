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

import { logger } from './logger';
import { Session } from './utils/types';
import { genReqId } from './utils/generator-request-id';

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
    logger: loggerContext.userId
      ? logger.create(
          `id:${loggerContext.id},userId:${loggerContext.userId},url:${loggerContext.url}`
        )
      : logger.create(`id:${loggerContext.id},url:${loggerContext.url}`)
  };
}

export default sessionFactory;
