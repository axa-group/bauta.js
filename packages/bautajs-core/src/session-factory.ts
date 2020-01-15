/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import hyperid from 'hyperid';
import { logger } from './logger';
import { Session } from './utils/types';

const idGenerator = hyperid();
const requestIdHeader = 'request-id';

function genReqId(headers: any): string {
  if (headers && headers[requestIdHeader]) {
    return headers[requestIdHeader];
  }

  return idGenerator();
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
    logger: loggerContext.userId
      ? logger.create(
          `id:${loggerContext.id},userId:${loggerContext.userId},url:${loggerContext.url}`
        )
      : logger.create(`id:${loggerContext.id},url:${loggerContext.url}`)
  };
}

export default sessionFactory;
