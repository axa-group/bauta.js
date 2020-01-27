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
