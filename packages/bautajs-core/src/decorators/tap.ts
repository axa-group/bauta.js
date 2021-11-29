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
 * Decorator that allows to transparently perform actions or side-effects,
 * such as logging and return the previous step result.
 *
 * @param {Pipeline.StepFunction<TIn, any>} stepFn - The step fn to execute
 * @returns {Pipeline.StepFunction<TIn, TIn>}
 *
 * @example
 *
 * const { tap, step, pipe } require('@axa/bautajs-core');
 *
 * const randomPreviousPipeline = step(() => 'I am so random!');
 *
 *  const pipeline = pipe(
 *    randomPreviousPipeline,
 *    tap((prev) => {
 *      console.log(`some intermediate step. Prev is ${prev}`);
 *      // => 'some intermediate step. Prev is I am so random!'
 *    }),
 *    (prev) => {
 *      console.log(prev);
 *      // print 'I am so random!'
 *    }
 *  );
 *
 */
export function tap<TIn>(stepFn: Pipeline.StepFunction<TIn, TIn>): Pipeline.StepFunction<TIn, TIn> {
  return (prev, ctx, bautajs) => {
    stepFn(prev, ctx, bautajs);

    return prev;
  };
}
