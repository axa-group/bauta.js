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
import { Dictionary, Response } from '../types';

const unknownFormats: Dictionary<boolean> = { int32: true, int64: true };

function isObject(obj: any) {
  return typeof obj === 'object' && obj !== null;
}

export function stripResponseFormats(schema: Response): Response {
  Object.keys(schema).forEach(item => {
    if (isObject(schema[item])) {
      if (schema[item].format && unknownFormats[schema[item].format]) {
        // eslint-disable-next-line no-param-reassign
        schema[item].format = undefined;
      }
      stripResponseFormats(schema[item]);
    }
  });

  return schema;
}
