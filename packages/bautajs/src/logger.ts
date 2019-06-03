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
import { Logger } from './utils/types';

const moduleName = 'bautajs';
const emmiter = new EventEmitter();

export class LoggerBuilder implements Logger {
  public debug: debug.Debugger;

  public trace: debug.Debugger;

  public log: debug.Debugger;

  public info: debug.Debugger;

  public warn: debug.Debugger;

  public error: debug.Debugger;

  public events: EventEmitter;

  constructor(namespace: string) {
    this.debug = debug(`${namespace}:debug`);
    this.trace = debug(`${namespace}:trace`);
    this.log = debug(`${namespace}:log`);
    this.info = debug(`${namespace}:info`);
    this.warn = debug(`${namespace}:warn`);
    this.error = debug(`${namespace}:error`);
    this.events = emmiter;
  }

  static create(namespace: string): Logger {
    return new LoggerBuilder(moduleName + namespace);
  }
}

export const logger = new LoggerBuilder(moduleName);
export default logger;
