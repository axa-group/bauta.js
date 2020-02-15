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
import fastSafeStringify from 'fast-safe-stringify';

const truncate = (string: string, limit: number): string => {
  if (string.length > limit) {
    return `${string.substring(0, limit)}...`;
  }
  return string;
};

export function prepareToLog(object: any): string {
  if (typeof object === 'object') {
    return truncate(fastSafeStringify(object), 3200);
  }

  return truncate(object, 32000);
}

export default prepareToLog;
