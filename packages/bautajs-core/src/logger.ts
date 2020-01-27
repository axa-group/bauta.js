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
import { EventEmitter } from 'events';
import { ContextLogger, Log, Logger } from './utils/types';

const moduleName = 'bautajs';
const emmiter = new EventEmitter();

export class LoggerBuilder implements Logger {
  public debug: Log;

  public trace: Log;

  public log: Log;

  public info: Log;

  public warn: Log;

  public error: Log;

  public events: EventEmitter;

  private debugInstance: debug.Debugger;

  constructor(namespace: string) {
    this.debugInstance = debug(namespace);
    this.debug = this.debugInstance.extend(':debug');
    this.trace = this.debugInstance.extend(':trace');
    this.log = this.debugInstance.extend(':log');
    this.info = this.debugInstance.extend(':info');
    this.warn = this.debugInstance.extend(':warn');
    this.error = this.debugInstance.extend(':error');
    this.events = emmiter;
  }

  create(namespace: string): ContextLogger {
    return {
      debug: (...args: any[]) => this.debug(namespace, ...args),
      trace: (...args: any[]) => this.trace(namespace, ...args),
      log: (...args: any[]) => this.log(namespace, ...args),
      info: (...args: any[]) => this.info(namespace, ...args),
      warn: (...args: any[]) => this.warn(namespace, ...args),
      error: (...args: any[]) => this.error(namespace, ...args),
      events: emmiter
    };
  }
}

export const logger = new LoggerBuilder(moduleName);
export default logger;
