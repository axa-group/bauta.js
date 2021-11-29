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
export function iif<TIn, TOut>(
  condition: (prev: TIn, ctx: Context, bautajs: BautaJSInstance) => boolean,
  pipeline: Pipeline.StepFunction<TIn, TOut>,
  elsePipeline?: Pipeline.StepFunction<TIn, TOut>
): Pipeline.StepFunction<TIn, TOut> {
  return (prev, ctx, bautajs) => {
    if (condition(prev, ctx, bautajs) === true) {
      return pipeline(prev, ctx, bautajs);
    }

    if (elsePipeline) {
      return elsePipeline(prev, ctx, bautajs);
    }

    // prettier-ignore
    return prev as unknown as TOut;
  };
}
