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
