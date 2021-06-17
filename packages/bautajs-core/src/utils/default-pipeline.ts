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
import { PipelineBuilder, OperatorFunction } from '../types';
import { pipelineBuilder } from '../decorators/pipeline';
import { NotFoundError } from '../core/not-found-error';

export function buildDefaultPipeline(): OperatorFunction<any, any> {
  return pipelineBuilder(
    (p: PipelineBuilder<any>) =>
      p.push(() => {
        const error = new NotFoundError('Not found');
        return Promise.reject(error);
      }),
    () => {}
  );
}

export default buildDefaultPipeline;