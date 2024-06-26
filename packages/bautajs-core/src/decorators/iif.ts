import { BautaJSInstance, Context, Pipeline } from '../types';
/**
 * @deprecated This function is deprecated and will be removed in future releases
 *
 * if elsePipeline is not provided there is no need to provide a third generic type variable
 *
 * remove the third not used generic and use the following instead
 * ```ts
 *  iif<TIn, TPipelineOut>(...)
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function iif<TIn, TPipelineOut, TElseNever>(
  condition: (prev: TIn, ctx: Context, bautajs: BautaJSInstance) => boolean,
  pipeline: Pipeline.StepFunction<TIn, TPipelineOut>
): Pipeline.StepFunction<TIn, TIn | TPipelineOut>;

export function iif<TIn, TPipelineOut>(
  condition: (prev: TIn, ctx: Context, bautajs: BautaJSInstance) => boolean,
  pipeline: Pipeline.StepFunction<TIn, TPipelineOut>
): Pipeline.StepFunction<TIn, TIn | TPipelineOut>;

export function iif<TIn, TPipelineOut, TElsePipelineOut>(
  condition: (prev: TIn, ctx: Context, bautajs: BautaJSInstance) => boolean,
  pipeline: Pipeline.StepFunction<TIn, TPipelineOut>,
  elsePipeline: Pipeline.StepFunction<TIn, TElsePipelineOut>
): Pipeline.StepFunction<TIn, TPipelineOut | TElsePipelineOut>;

/**
 * Decorator that allows to execute given pipeline conditionally. It accepts the condition step function and pipeline.
 * If the condition step function will be evaluated to truthy value the pipeline will be executed.
 * If the condition step function will be evaluated to falsy:
 *  If the elsePipeline is defined, it will be executed and the value will be passed
 *  If the elsePipeline is not defined, the input value of iif decorator will be passed as a pass through
 *
 * @param {Pipeline.StepFunction<TIn, boolean>} condition - boolean that determines if the pipeline is going to be executed
 * @param {Pipeline.StepFunction<TIn, TOut>} pipeline - pipeline to execute if the condition is truthy
 * @param {Pipeline.StepFunction<TIn, TOut>} elsePipeline - optional pipeline to execute if the condition is falsy
 * @returns {Pipeline.StepFunction<TIn, TOut>}
 *
 * @example
 *
 * const { iif, step, pipe } require('@bautajs/core');
 *
 * const randomPreviousPipeline = step(() => 'I am so random!');
 * const manageOnlyStringsPipeline = step(() => 'I can manage only strings, otherwise I crash');
 * const manageNonStringsPipeline = step(() => 'Input was not a string');
 *
 *  const pipelineWithoutElse = pipe(
 *    randomPreviousPipeline,
 *    iif(prev => typeof prev === 'string', manageOnlyStringsPipeline)
 *  );
 *
 *  const pipelineWithElse = pipe(
 *    randomPreviousPipeline,
 *    iif(prev => typeof prev === 'string', manageOnlyStringsPipeline, manageNonStringsPipeline)
 *  );
 *
 */
export function iif<TIn, TPipelineOut, TElsePipelineOut>(
  condition: (prev: TIn, ctx: Context, bautajs: BautaJSInstance) => boolean,
  pipeline: Pipeline.StepFunction<TIn, TPipelineOut>,
  elsePipeline?: Pipeline.StepFunction<TIn, TElsePipelineOut>
): Pipeline.StepFunction<TIn, TIn | TPipelineOut | TElsePipelineOut> {
  return (prev, ctx, bautajs) => {
    if (condition(prev, ctx, bautajs) === true) {
      return pipeline(prev, ctx, bautajs);
    }

    if (elsePipeline) {
      return elsePipeline(prev, ctx, bautajs);
    }

    // prettier-ignore
    return prev as unknown as TIn;
  };
}
