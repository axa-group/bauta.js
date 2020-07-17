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

const truncate = (string: string, limit: number, disableTruncateLog: boolean): string => {
  const disabledMessage = disableTruncateLog ? '[full log truncate disabled]' : '';
  if (string.length > limit && !disableTruncateLog) {
    return `${string.substring(0, limit)}...`;
  }
  return `${disabledMessage}${string}`;
};

export function prepareToLog(
  object: any,
  truncateLogSize = 3200,
  disableTruncateLog = false
): string {
  if (typeof object === 'object') {
    return truncate(fastSafeStringify(object), truncateLogSize, disableTruncateLog);
  }

  return truncate(object, truncateLogSize * 10, disableTruncateLog);
}

export default prepareToLog;
