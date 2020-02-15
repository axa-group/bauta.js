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
import hyperid from 'hyperid';
import { Session, Logger } from './types';
import { ContextLogger } from './context-logger';

const idGenerator = hyperid();
const requestIdHeader = 'request-id';

function genReqId(headers: any): string {
  if (headers && headers[requestIdHeader]) {
    return headers[requestIdHeader];
  }

  return idGenerator();
}

function generateBaseSession(req: any): any {
  const { headers } = req;
  const id = !req.id ? genReqId(headers) : req.id;

  const session = {
    id,
    url: req.url,
    userId: null,
    logger: null
  };

  if (headers && headers.authorization) {
    session.userId = headers.authorization.substring(headers.authorization.length - 6);
  }

  return session;
}

function generateSessionNamespace(session: Session): string {
  return session.userId
    ? `id:${session.id},userId:${session.userId},url:${session.url}`
    : `id:${session.id},url:${session.url}`;
}

/**
 * @ignore
 * Build a session id from the given req id and authorization token, that will be available a cross the operation chain
 */
export function sessionFactory(req: any, logger: Logger): Session {
  const session: Session = generateBaseSession(req);
  const namespace = generateSessionNamespace(session);

  session.logger = new ContextLogger(logger, namespace);

  return session;
}

export default sessionFactory;
