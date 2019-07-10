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
import memoizee from 'memoizee';
import { Accesor, Context, Pipeline, PipelineBuilder, Services, StepFn } from '@bautajs/core';

export type Normalizer<TIn> = (value: [TIn, Context, Services]) => any;

/**
 * Cache the given steps with [memoizee](https://www.npmjs.com/package/memoizee)
 * @export
 * @template TIn
 * @param {(pipeline: Pipeline<TIn>) => void} fn
 * @param {Normalizer<TIn>} normalizer
 * @param {memoizee.Options} [options={}]
 * @returns {StepFn<TIn, any>}
 * @example
 * const { cache } = require('@batuajs/cache-decorator');
 * const { request } = require('@batuajs/decorators');
 *
 * services.v1.test.op1.setup(p => p.push(cache(request(), ([_,ctx] => ctx.token))))
 */
export function cache<TIn>(
  fn: (pipeline: Pipeline<TIn>) => void,
  normalizer: Normalizer<TIn>,
  options: memoizee.Options = {}
): StepFn<TIn, null> {
  if (!normalizer) {
    throw new Error(
      'normalizer: (args)=>{} function is a mandatory parameter to calculate the cache key'
    );
  }
  const accessor = new Accesor();
  const flow = new PipelineBuilder<TIn>(accessor, '', '', '');
  fn(flow);
  const cached = memoizee(accessor.handler, {
    ...options,
    normalizer,
    promise: true
  });

  return async (value: TIn, ctx: Context, services: Services) => cached(value, ctx, services);
}

export default cache;
