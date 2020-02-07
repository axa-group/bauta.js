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
import debug from 'debug';

import { Log, Logger } from './utils/types';

const DEFAULT_LOGGER_NAME = 'bautajs';

export class DefaultLogger implements Logger {
  public debug: Log;

  public trace: Log;

  public info: Log;

  public warn: Log;

  public error: Log;

  public fatal: Log;

  private debugInstance: debug.Debugger;

  constructor(namespace: string = DEFAULT_LOGGER_NAME) {
    this.debugInstance = debug(namespace);
    this.debug = this.debugInstance.extend(':debug');
    this.trace = this.debugInstance.extend(':trace');
    this.fatal = this.debugInstance.extend(':fatal');
    this.info = this.debugInstance.extend(':info');
    this.warn = this.debugInstance.extend(':warn');
    this.error = this.debugInstance.extend(':error');
  }
}

export default DefaultLogger;
