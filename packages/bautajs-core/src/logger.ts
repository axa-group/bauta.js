/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
