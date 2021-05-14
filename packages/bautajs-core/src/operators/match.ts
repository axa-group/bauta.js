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
import { BautaJSInstance, Context, Pipeline } from '../types';

/**
 * Resolve the given predicate an execute the pipeline for that condition
 *
 * @export
 * @interface Match
 * @template TIn
 * @template TOut
 * @template TRequest
 * @template TResponse
 */
export interface Match<TIn, TOut> {
  pipeline?: Pipeline.StepFunction<TIn, TOut>;
  /**
   * Set a predicate function that have to return true or false. Depending on that resolution the
   * given pipeline will be executed.
   *
   * @param {(prev: TIn, ctx: Context, bautajs: BautaJSInstance) => boolean} pred
   * @param {Pipeline.StepFunction<TIn, TOut>} pipeline
   * @returns {Match<TIn, TOut>}
   * @memberof Match
   */
  on(
    pred: (prev: TIn, ctx: Context, bautajs: BautaJSInstance) => boolean,
    pipeline: Pipeline.StepFunction<TIn, TOut>
  ): Match<TIn, TOut>;
  /**
   * Set the pipeline that will be executed by default if any of the given predicates succed.
   *
   * @param {Pipeline.StepFunction<TIn, TOut>} pipeline
   * @memberof Match
   */
  otherwise(pipeline: Pipeline.StepFunction<TIn, TOut>): void;
}

class MatchBuilder<TIn, TOut> implements Match<TIn, TOut> {
  public pipeline?: Pipeline.StepFunction<TIn, TOut>;

  private matched: boolean = false;

  constructor(private value: any, private ctx: Context, private bautajs: BautaJSInstance) {
    // eslint-disable-next-line no-empty-function
  }

  on(
    pred: Pipeline.StepFunction<TIn, Boolean>,
    pipeline: Pipeline.StepFunction<TIn, TOut>
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

  otherwise(pipeline: Pipeline.StepFunction<TIn, TOut>) {
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
 * @returns {Pipeline.StepFunction<TIn, TOut>}
 * @example
 * const { match, pipe } = require('@batuajs/core');
 *
 * const findCatsPipeline = pipe(...);
 * const logResultPipeline = pipe(...);
 *
 * bautajsInstance.operations.v1.findcats.setup(pipe(
 *    () => 1,
 *    match(m =>
 *        m.on((prev) => prev === 1, findCatsPipeline)
 *        .otherwise(logResultPipeline)
 *   )
)
 */
export function match<TIn, TOut>(
  matchFn: (m: Match<TIn, TOut>) => any
): Pipeline.StepFunction<TIn, TOut> {
  return (val: TIn, ctx: Context, bautajs: BautaJSInstance): PromiseLike<TOut> | TOut => {
    const builder = new MatchBuilder<TIn, TOut>(val, ctx, bautajs);

    matchFn(builder);
    if (builder.pipeline) {
      return builder.pipeline(val, ctx, bautajs);
    }

    return null as any;
  };
}

export default match;
