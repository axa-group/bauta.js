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
import { ContextData, Context } from './types';
import { CancelableTokenBuilder } from '../core/cancelable-token';
import { sessionFactory } from '../session-factory';

export function createContext(ctx: ContextData): Context {
  if (!ctx.req) {
    ctx.req = {};
  }

  if (!ctx.res) {
    ctx.res = {};
  }

  const token = new CancelableTokenBuilder();

  return Object.assign(
    {
      validateResponse: () => null,
      validateRequest: () => null,
      data: ctx.data || {},
      req: ctx.req,
      res: ctx.res,
      token
    },
    sessionFactory(ctx.req)
  );
}

export default createContext;
