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
import { isMergeableObject } from './utils/is-mergeable-object';
import { prepareToLog } from './utils/prepare-to-log';

export * from './bauta';
export * from './core/validation-error';
export * from './core/service';
export * from './core/operation';
export * from './core/pipeline';
export * from './core/datasource';
export * from './decorators/resolver';
export * from './decorators/step';
export * from './decorators/pipeline';
export * from './decorators/datasource';
export * from './decorators/as-callback';
export * from './decorators/as-value';
export * from './decorators/parallel';
export * from './utils/types';
export * from './logger';

export const utils = {
  isMergeableObject,
  prepareToLog
};
