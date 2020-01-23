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
import got, {
  ExtendOptions,
  NormalizedOptions,
  Response,
  Got,
  GotReturn,
  CancelableRequest,
  ResponseStream,
  GeneralError,
  ParseError,
  GotError
} from 'got';
import { createHttpAgent, createHttpsAgent } from 'native-proxy-agent';
import { Context, BautaJSInstance, utils, ContextLogger } from '@bautajs/core';

export enum EventTypes {
  /**
   * A provider was executed with the given options.
   */
  PROVIDER_EXECUTION = '3',
  /**
   * A provider execution finished with the given result.
   */
  PROVIDER_RESULT = '4'
}

export enum ResponseType {
  JSON = 'json',
  BUFFER = 'buffer',
  TEXT = 'text'
}

export interface RequestLog {
  url: string | undefined;
  method: string | undefined;
  headers: string;
  body?: string;
}

export type ProviderOperation<TOut> = (
  client: Got,
  value: any,
  ctx: Context,
  bautajs: BautaJSInstance
) => GotReturn<TOut>;

const httpAgent = createHttpAgent();
const httpsAgent = createHttpsAgent();
const isDebugLogLevel = process.env.LOG_LEVEL?.toLocaleLowerCase() === 'debug';

function logRequestHook(logger: ContextLogger) {
  return (options: NormalizedOptions) => {
    logger.info(`request-logger: Request to [${options.method}] ${options.url.href}`);
    if (isDebugLogLevel) {
      const requestData: RequestLog = {
        url: options.url.href,
        method: options.method,
        headers: utils.prepareToLog(options.headers)
      };
      if (options.body || options.json) {
        requestData.body = utils.prepareToLog(options.body || options.json);
      }
      logger.debug(`request-logger: Request data: `, requestData);
      logger.events.emit(EventTypes.PROVIDER_EXECUTION, options);
    }
  };
}
function logErrorsHook(logger: ContextLogger) {
  return (error: GeneralError) => {
    const parseError = error as ParseError;
    const genericError = error as GotError;
    if (parseError.response && parseError.response.body) {
      logger.error(
        `response-logger: Error for [${parseError.options.method}] ${parseError.options.url}:`,
        {
          statusCode: parseError.response.statusCode,
          body: utils.prepareToLog(parseError.response.body)
        }
      );
    } else if (genericError.options) {
      logger.error(
        `response-logger: Error for [${genericError.options.method}] ${genericError.options.url}:`,
        {
          name: genericError.name,
          code: genericError.code,
          message: genericError.message
        }
      );
    } else {
      logger.error(`response-logger: Internal error on the datasource request:`, {
        message: error.message,
        name: error.name
      });
    }

    return error;
  };
}
function logResponseHook(logger: ContextLogger) {
  return (response: Response) => {
    if (response.fromCache) {
      logger.info(`response-logger: Response for ${response.requestUrl} is cached`);
    } else {
      if (isDebugLogLevel) {
        logger.debug(
          `response-logger: Response for [${response.request.options.method}] ${response.requestUrl}: `,
          {
            headers: utils.prepareToLog(response.headers),
            statusCode: response.statusCode,
            body: utils.prepareToLog(response.body)
          }
        );
      }
      const totalTime = response.timings.phases.total;
      logger.info(`response-logger: The request to ${response.requestUrl} took: ${totalTime} ms`);
    }
    logger.events.emit(EventTypes.PROVIDER_RESULT, response);

    return response;
  };
}

function addRequestId(ctx: Context) {
  return (options: NormalizedOptions) => {
    if (!options.headers) {
      // eslint-disable-next-line no-param-reassign
      options.headers = {};
    }
    // eslint-disable-next-line no-param-reassign
    options.headers['x-request-id'] = ctx.id;
  };
}

function addAgent(options: NormalizedOptions, next: any) {
  if (options.agent === undefined) {
    // eslint-disable-next-line no-param-reassign
    options.agent = options.url.protocol === 'https' ? httpsAgent : httpAgent;
  }

  return next(options);
}

function operatorFn(client: Got, fn: ProviderOperation<any>) {
  return <TIn, TOut>(value: TIn, ctx: Context, bautajs: BautaJSInstance) => {
    const promiseOrStream = fn(
      client.extend({
        hooks: {
          beforeRequest: [addRequestId(ctx), logRequestHook(ctx.logger)],
          afterResponse: [logResponseHook(ctx.logger)],
          beforeError: [logErrorsHook(ctx.logger)]
        }
      }),
      value,
      ctx,
      bautajs
    );
    ctx.token.onCancel(() => {
      ctx.logger.error(`Request was canceled`);
      if (typeof (promiseOrStream as CancelableRequest<TOut>).cancel === 'function') {
        (promiseOrStream as CancelableRequest<TOut>).cancel();
      } else if (typeof (promiseOrStream as ResponseStream).destroy === 'function') {
        (promiseOrStream as ResponseStream).destroy();
      }
    });
    return promiseOrStream;
  };
}

export function restProvider(fn: ProviderOperation<any>) {
  return (options: ExtendOptions = {}) => {
    const client = got.extend({
      ...options,
      handlers: [addAgent],
      responseType: 'json',
      resolveBodyOnly: true
    });
    return operatorFn(client, fn);
  };
}

export default restProvider;
