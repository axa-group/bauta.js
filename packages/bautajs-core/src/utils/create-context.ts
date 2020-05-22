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
import { ContextData, Context, Logger } from '../types';
import { CancelableTokenBuilder } from '../core/cancelable-token';
import { genReqId } from './request-id-generator';

export function createContext(ctx: ContextData, logger: Logger, operationId: string): Context {
  if (!ctx.req) {
    ctx.req = {};
  }

  if (!ctx.res) {
    ctx.res = {};
  }

  const token = new CancelableTokenBuilder();
  const { headers } = ctx.req;
  const reqId = !ctx.req.id ? genReqId(headers) : ctx.req.id;
  let ctxLogger: Logger;
  if (!ctx.req.log) {
    // Just create the context logger if there is no child logger already created by the framework used such fastify req.log
    ctxLogger = logger.child({
      url: ctx.req.url,
      reqId,
      operationId
    });
  } else {
    ctxLogger = ctx.req.log;
  }

  return {
    validateResponse: () => null,
    validateRequest: () => null,
    validateResponseSchema: () => null,
    data: ctx.data || {},
    req: ctx.req,
    res: ctx.res,
    token,
    id: reqId,
    logger: ctxLogger,
    url: ctx.req.url
  };
}

export default createContext;
