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
import { ExtendOptions, Got, BeforeRequestHook, AfterResponseHook, BeforeErrorHook } from 'got';
import { Context, BautaJSInstance, Pipeline, Logger } from '@bautajs/core';

export interface LogHooks {
  logRequestHook?: (
    /**
     * Recommended logger to be used.
     */
    log: (...args: any[]) => void,
    restProviderOptions: RestProviderOptions,
    /**
     * Log all ignoring the log level.
     */
    logAll: boolean,
    /**
     * Current request logger.
     */
    logger: Logger
  ) => BeforeRequestHook;
  logResponseHook?: (
    /**
     * Recommended logger to be used.
     */
    log: (...args: any[]) => void,
    restProviderOptions: RestProviderOptions,
    /**
     * Log all ignoring the log level.
     */
    logAll: boolean,
    /**
     * Current request logger.
     */
    logger: Logger
  ) => AfterResponseHook;
  logErrorsHook?: (
    /**
     * Recommended logger to be used.
     */
    log: (...args: any[]) => void,
    restProviderOptions: RestProviderOptions,
    /**
     * Log all ignoring the log level.
     */
    logAll: boolean,
    /**
     * Current request logger.
     */
    logger: Logger
  ) => BeforeErrorHook;
}

export interface RestProviderOptions {
  /**
   * Override the internal logger hooks
   *
   * @type {LogHooks}
   * @memberof RestProviderOptions
   */
  logHooks?: LogHooks;
  /**
   * Ignore the process.env.LOG_LEVEL and log all data (body, headers...)
   *
   * @type {boolean}
   * @memberof RestProviderOptions
   */
  ignoreLogLevel?: boolean;
  /**
   * Indicates the size after which request and response body are truncated in the logs.
   *
   * @type {number}
   * @memberof RestProviderOptions
   * @deprecated use maxBodyLogSize instead
   */
  truncateBodyLogSize?: number;

  /**
   * Indicates if the truncation of the request and response logs are disabled. Avoid setting this to true in production, this is a utility though for troubleshooting development issues.
   *
   * @type {boolean}
   * @memberof RestProviderOptions
   * @deprecated use maxBodyLogSize instead
   */
  disableBodyTruncateLog?: boolean;
  /**
   * Indicates the max request and response body length in bytes that is permitted to log.
   *
   * @default 16384
   * @type {number}
   * @memberof RestProviderOptions
   */
  maxBodyLogSize?: number;
}
export type ProviderOperation<TOut> = (
  client: Got,
  value: any,
  ctx: Context,
  bautajs: BautaJSInstance
) => TOut | Promise<TOut>;
export type Provider<TOut> = <TIn>(options?: ExtendOptions) => Pipeline.StepFunction<TIn, TOut>;
export interface RestProvider {
  <TOut>(fn: ProviderOperation<TOut>, restProviderOptions?: RestProviderOptions): Provider<TOut>;
  extend: (options?: ExtendOptions) => RestProvider;
}
