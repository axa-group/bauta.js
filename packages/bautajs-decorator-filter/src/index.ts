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
import loopbackFilters, { Filter } from 'loopback-filters';
import { Context, StepFn } from '@bautajs/core';

export interface LoopbackQuery {
  filter: Filter;
}
export interface LoopbackRequest {
  query: LoopbackQuery;
}

/**
 * Allow to filter the current request using loopback query filters.
 * This decorator will filter the previous pushed value using the req.query.filter parameter of the request
 * @export
 * @template TIn
 * @returns {StepFn<
 *   TIn[],
 *   TIn[]
 * >}
 * @example
 * const { queryFilter } = require('@bautajs/filters-decorator');
 *
 * operations.v1.op1.setup(p => p.push(queryFilter()))
 */
export function queryFilters<TIn>(): StepFn<TIn[], TIn[]> {
  return (value: TIn[], ctx: Context): TIn[] => {
    const queryFilter = ctx.req.query && ctx.req.query.filter;

    return queryFilter && Array.isArray(value) ? loopbackFilters<TIn[]>(value, queryFilter) : value;
  };
}

export default queryFilters;
