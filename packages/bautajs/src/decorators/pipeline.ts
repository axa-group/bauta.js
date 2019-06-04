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
import { Pipeline } from '../utils/types';

/**
 * A decorator to allow intellisense on pipeline on non typescript files
 * @export
 * @template TReq
 * @template TRes
 * @template TIn
 * @param {Pipeline<TReq, TRes, TIn>} fn
 * @returns
 */
export function pipeline<TReq, TRes, TIn>(fn: (pipeline: Pipeline<TReq, TRes, TIn>) => void) {
  return fn;
}

export default pipeline;
