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
import { OperatorFunction, BautaJSInstance, Match, Context } from '../utils/types';

class MatchBuilder<TIn, TOut> implements Match<TIn, TOut> {
  public pipeline?: OperatorFunction<TIn, TOut>;

  private matched: boolean = false;

  constructor(private value: any, private ctx: Context, private bautajs: BautaJSInstance) {
    // eslint-disable-next-line no-empty-function
  }

  on(
    pred: (prev: TIn, ctx: Context, bautajs: BautaJSInstance) => boolean,
    pipeline: OperatorFunction<TIn, TOut>
  ): Match<TIn, TOut> {
    if (typeof pred !== 'function') {
      throw new Error('Match.on predicate must be a function.');
    }
    if (typeof pipeline !== 'function') {
      throw new Error('Match.on pipeline must be a built with `pipeline` builder.');
    }

    if (!this.matched && pred(this.value, this.ctx, this.bautajs)) {
      this.pipeline = pipeline;

      this.matched = true;
    }

    return this;
  }

  otherwise(pipeline: OperatorFunction<TIn, TOut>) {
    if (typeof pipeline !== 'function') {
      throw new Error('Match.otherwise pipeline must be a built with `pipeline` builder.');
    }

    if (!this.matched) {
      this.pipeline = pipeline;
    }
  }
}

/**
 * Allow to chose which pipeline execute depending on the given condition
 * @export
 * @template TIn
 * @template TOut
 * @param {(m: Match<TIn, TOut>) => any} matchFn
 * @returns {OperatorFunction<TIn, TOut>}
 * @example
 * const { match, pipeline } = require('@batuajs/core');
 * 
 * const findCatsPipeline = pipeline(...);
 * const logResultPipeline = pipeline(...);
 *
 * bautajsInstance.operations.v1.findcats.setup(
 *  p =>
 *    p.push(() => 1)
 *    .push(
 *      match(m => 
 *        m.on((prev) => prev === 1, findCatsPipeline)
 *        .otherwise(logResultPipeline)
 *     )
 *   )
)
 */
export function match<TIn, TOut>(
  matchFn: (m: Match<TIn, TOut>) => any
): OperatorFunction<TIn, TOut> {
  return async (val: TIn, ctx: Context, bautajs: BautaJSInstance): Promise<TOut> => {
    const builder = new MatchBuilder<TIn, TOut>(val, ctx, bautajs);

    matchFn(builder);
    if (builder.pipeline) {
      return builder.pipeline(val, ctx, bautajs);
    }

    return null as any;
  };
}

export default match;
