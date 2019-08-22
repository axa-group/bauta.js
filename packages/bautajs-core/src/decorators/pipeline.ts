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
import { PipelineSetup, OperatorFunction, EventTypes } from '../utils/types';
import { Builder, Accesor } from '../core/pipeline-builder';
import { logger } from '../logger';

function defaultOnPush(param: any) {
  logger.info(`[OK] ${param.name || 'anonymous function'} pushed to anonymous pipeline`);
  logger.events.emit(EventTypes.PUSH_OPERATOR, {
    operator: param
  });
}

/**
 * A decorator to give itellicense to a pipeline.
 * @export
 * @template TIn
 * @param {PipelineSetup<TIn>} pipelineSetup
 * @returns PipelineSetup<TIn>
 */
export function pipeline<TIn>(pipelineSetup: PipelineSetup<TIn>): PipelineSetup<TIn> {
  return pipelineSetup;
}

/**
 * A decorator to create a pipeline that can be executed.
 * @export
 * @template TIn
 * @template TOut
 * @param {PipelineSetup<TIn>} pipelineSetup
 * @param {(param: any) => void} onPush
 * @returns OperatorFunction<TIn, TOut>
 */
export function pipelineBuilder<TIn, TOut>(
  pipelineSetup: PipelineSetup<TIn>,
  onPush?: (param: any) => void
): OperatorFunction<TIn, TOut> {
  const pp = new Builder<TIn>(new Accesor(), onPush || defaultOnPush);
  pipelineSetup(pp);
  return (prev, ctx, bautajs) => {
    let result = pp.accesor.handler(prev, ctx, bautajs);

    if (!(result instanceof Promise)) {
      result = Promise.resolve(result);
    }
    return result.catch(async (e: Error) => pp.accesor.errorHandler(e, ctx));
  };
}

export default pipeline;
