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

import { Pipeline } from '../types';
/**
 * Operator that allows to execute given pipeline conditionally. It accepts the condition step function and pipeline.
 * If the condition step function will be evaluated to truthy value the pipeline will be executed.
 * If the condition step function will be evaluated to falsy value the operator will work as a pass through and will return value
 * received as prev in condition step function
 *
 * @param {Pipeline.StepFunction<TIn, Boolean>} condition - boolean that determines if the pipeline is going to be executed
 * @param {Pipeline.StepFunction<TIn, TOut>} pipeline - pipeline to execute if the condition is truthy
 * @returns {Pipeline.StepFunction<TIn, TOut>}
 *
 * @example
 * 
 * import { iff, pipeline } from @bautajs/core
 * 
 * const randomPreviousPipeline = pipe(() => 'I am so random!');
 * const manageOnlyStringsPipeline = pipe(() => 'I can manage only strings, otherwise I crash');

 *  const pipeline = pipe(
 *    randomPreviousPipeline,
 *    iff(prev => typeof prev === 'string', manageOnlyStringsPipeline)
 *  );
 * 
 */
export function iff<TIn, TOut>(
  condition: Pipeline.StepFunction<TIn, Boolean>,
  pipeline: Pipeline.StepFunction<TIn, TOut>
): Pipeline.StepFunction<TIn, TOut> {
  return (prev, ctx, bautajs) => {
    if (condition(prev, ctx, bautajs) === true) {
      return pipeline(prev, ctx, bautajs);
    }
    return prev as unknown as TOut;
  };
}
