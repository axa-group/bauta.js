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
import { Logger, Log } from './types';

export class ContextLogger implements Logger {
  public debug: Log;

  public trace: Log;

  public info: Log;

  public warn: Log;

  public error: Log;

  public fatal: Log;

  constructor(logger: Logger, namespace: string) {
    this.debug = (...args: any[]) => logger.debug(namespace, ...args);
    this.trace = (...args: any[]) => logger.trace(namespace, ...args);
    this.fatal = (...args: any[]) => logger.fatal(namespace, ...args);
    this.info = (...args: any[]) => logger.info(namespace, ...args);
    this.warn = (...args: any[]) => logger.warn(namespace, ...args);
    this.error = (...args: any[]) => logger.error(namespace, ...args);
  }
}

export default ContextLogger;
