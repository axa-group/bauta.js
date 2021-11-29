import { ExtendOptions, Got, BeforeRequestHook, AfterResponseHook, BeforeErrorHook } from 'got';
import { Context, BautaJSInstance, Pipeline, Logger } from '@axa/bautajs-core';

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
