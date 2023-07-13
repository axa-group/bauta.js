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
  /**
   * Sets a condition step function that returns a boolean and a second statement step function.
   * If the result of the condition step function is true, the statement step function is executed.
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
   * Set the pipeline that will be executed by default if any of the given conditions are not returning true.
   *
   * @param {Pipeline.StepFunction<TIn, TOut>} pipeline
   * @memberof Match
   */
  otherwise(pipeline: Pipeline.StepFunction<TIn, TOut>): void;
}

class MatchBuilder<TIn, TOut> implements Match<TIn, TOut> {
  private matchers: {
    pred: Pipeline.StepFunction<TIn, boolean>;
    pipeline: Pipeline.StepFunction<TIn, TOut>;
  }[] = [];

  // eslint-disable-next-line class-methods-use-this
  private otherwisePipeline: Pipeline.StepFunction<TIn, TOut> = () => null as any;

  run(value: TIn, ctx: Context, bautajs: BautaJSInstance) {
    const matcher = this.matchers.find(({ pred }) => pred(value, ctx, bautajs));

    return matcher?.pipeline
      ? matcher.pipeline(value, ctx, bautajs)
      : this.otherwisePipeline(value, ctx, bautajs);
  }

  on(
    pred: Pipeline.StepFunction<TIn, boolean>,
    pipeline: Pipeline.StepFunction<TIn, TOut>
  ): Match<TIn, TOut> {
    if (typeof pred !== 'function') {
      throw new Error('Match.on predicate must be a function.');
    }
    if (typeof pipeline !== 'function') {
      throw new Error('Match.on pipeline must be a built with `pipeline` builder.');
    }

    this.matchers.push({
      pred,
      pipeline
    });

    return this;
  }

  otherwise(pipeline: Pipeline.StepFunction<TIn, TOut>) {
    if (typeof pipeline !== 'function') {
      throw new Error('Match.otherwise pipeline must be a built with `pipeline` builder.');
    }

    this.otherwisePipeline = pipeline;
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
  const builder = new MatchBuilder<TIn, TOut>();
  matchFn(builder);

  return builder.run.bind(builder);
}

export default match;
