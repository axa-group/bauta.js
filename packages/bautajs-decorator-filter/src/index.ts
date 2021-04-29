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
import loopbackFilters, { Filter } from 'loopback-filters';
import { Context, Pipeline } from '@bautajs/core';

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
 * @returns {Pipeline.StepFunction<
 *   TIn[],
 *   TIn[]
 * >}
 * @example
 *   const { getRequest } = require('@bautajs/express');
 *   const { resolver } = require('@bautajs/core');
 *   const { queryFilter } = require('@bautajs/decorator-filter');
 *
 *    module.exports = resolver((operations)=> {
 *        operations.v1.get.setup(pipe(() => [{a:'foo'}, {a:'foo2'}],queryFilter((ctx) => getRequest(ctx).query.filter))
 *    })
 */
export function queryFilters<TIn>(
  resolveFilter: (ctx: Context) => Filter
): Pipeline.StepFunction<TIn[], TIn[]> {
  return (value: TIn[], ctx: Context): TIn[] => {
    const queryFilter = resolveFilter(ctx);

    return queryFilter && Array.isArray(value) ? loopbackFilters<TIn[]>(value, queryFilter) : value;
  };
}

export default queryFilters;
