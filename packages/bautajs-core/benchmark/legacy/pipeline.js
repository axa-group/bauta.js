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
/**
 * File with legacy pipeline builder. It's only needed for benchmark propose.
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.pipelineBuilder = void 0;
const pipeline_builder_1 = require('./pipeline-builder');
const accessor_1 = require('./accessor');

function defaultOnPush() {}
/**
 * A decorator to create a pipeline that can be executed.
 * @export
 * @template TIn
 * @template TOut
 * @param {PipelineSetup<TIn>} pipelineSetup
 * @param {(param: any) => void} onPush
 * @returns Pipeline.StepFunction<TIn, TOut>
 */
function pipelineBuilder(pipelineSetup, onPush) {
  const pp = new pipeline_builder_1.Builder(new accessor_1.Accessor(), onPush || defaultOnPush);
  pipelineSetup(pp);
  return (prev, ctx, bautajs) => {
    let result;
    // if not a promise but throw, manage the error
    try {
      result = pp.accessor.handler(prev, ctx, bautajs);
    } catch (e) {
      return pp.accessor.errorHandler(e, ctx, bautajs);
    }
    if (result instanceof Promise) {
      result = result.catch(async e => pp.accessor.errorHandler(e, ctx, bautajs));
    }
    return result;
  };
}
exports.pipelineBuilder = pipelineBuilder;
// # sourceMappingURL=pipeline.js.map
