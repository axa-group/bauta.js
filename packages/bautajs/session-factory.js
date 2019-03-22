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
const safeStringify = require('fast-safe-stringify');
const logger = require('./logger');

const maxInt = 2147483647;
const requestIdHeader = 'request-id';
let nextReqId = 0;

function genReqId(req) {
  // eslint-disable-next-line no-bitwise
  nextReqId = (nextReqId + 1) & maxInt;
  return req.headers && req.headers[requestIdHeader] ? req.headers[requestIdHeader] : nextReqId;
}

/**
 * @ignore
 * Build a session id from the given req id and authorization token, that will be available a cross the operation chain
 */
module.exports = req => {
  const context = {};
  if (!req.id) {
    context.id = genReqId(req);
  } else {
    context.id = req.id;
  }

  if (req.headers && req.headers.authorization) {
    context.userId = req.headers.authorization.substring(req.headers.authorization.length - 6);
  }

  context.url = req.url;

  return { ...context, logger: logger.create(safeStringify(context)) };
};
