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
import loopbackFilters, { Filter } from 'loopback-filters';
import { Context, OperatorFunction } from '@bautajs/core';

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
 * @returns {OperatorFunction<
 *   TIn[],
 *   TIn[]
 * >}
 * @example
 * const { queryFilter } = require('@bautajs/filters-decorator');
 *
 * operations.v1.op1.setup(p => p.push(queryFilter()))
 */
export function queryFilters<TIn>(): OperatorFunction<TIn[], TIn[]> {
  return (value: TIn[], ctx: Context): TIn[] => {
    const queryFilter = ctx.req.query && ctx.req.query.filter;

    return queryFilter && Array.isArray(value) ? loopbackFilters<TIn[]>(value, queryFilter) : value;
  };
}

export default queryFilters;
