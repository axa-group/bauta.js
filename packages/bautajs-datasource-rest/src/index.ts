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
import got, {
  HTTPError,
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
import { Context, BautaJSInstance, utils, Logger } from '@bautajs/core';

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
const isDebugLogLevel = process.env.LOG_LEVEL?.toLowerCase() === 'debug';

function logRequestHook(logger: Logger) {
  return (options: NormalizedOptions) => {
    logger.info(`request-logger: Request to [${options.method}] ${options.url}`);
    if (isDebugLogLevel) {
      const requestData: RequestLog = {
        url: options.url.toString(),
        method: options.method,
        headers: utils.prepareToLog(options.headers)
      };
      if (options.body || options.json) {
        requestData.body = utils.prepareToLog(options.body || options.json);
      }
      logger.debug({ requestData }, 'request-logger: Request data');
    }
  };
}
function logErrorsHook(logger: Logger) {
  return (error: GeneralError) => {
    const parseError = error as ParseError;
    const genericError = error as GotError;
    if (parseError.response && parseError.response.body) {
      logger.error(
        {
          providerUrl: `[${parseError.options.method}] ${parseError.options.url}`,
          error: {
            statusCode: parseError.response.statusCode,
            body: utils.prepareToLog(parseError.response.body),
            name: parseError.name,
            message: parseError.message
          }
        },
        `response-logger: Error for [${parseError.options.method}] ${parseError.options.url}`
      );
    } else if (genericError.options) {
      logger.error(
        {
          providerUrl: `[${genericError.options.method}] ${genericError.options.url}`,
          error: {
            name: genericError.name,
            code: genericError.code,
            message: genericError.message
          }
        },
        `response-logger: Error for [${genericError.options.method}] ${genericError.options.url}`
      );
    } else {
      logger.error(
        {
          error: {
            message: error.message,
            name: error.name
          }
        },
        `response-logger: Internal error on a provider request`
      );
    }

    return error;
  };
}
function logResponseHook(logger: Logger) {
  return (response: Response) => {
    if (response.isFromCache) {
      logger.info(`response-logger: Response for ${response.requestUrl} is cached.`);
    } else {
      if (isDebugLogLevel) {
        logger.debug(
          {
            providerUrl: `[${response.request.options.method}] ${response.requestUrl}`,
            response: {
              headers: utils.prepareToLog(response.headers),
              statusCode: response.statusCode,
              body: utils.prepareToLog(response.body)
            }
          },
          `response-logger: Response for [${response.request.options.method}] ${response.requestUrl}`
        );
      }
      const totalTime = response.timings ? response.timings.phases.total : 'unknown';
      logger.info(`response-logger: The request to ${response.requestUrl} took: ${totalTime} ms`);
    }

    return response;
  };
}

function addErrorStatusCode(error: GeneralError) {
  if (error instanceof HTTPError) {
    Object.assign(error, {
      statusCode: error.response.statusCode,
      message: (error.response.body as any)?.message || (error.response.body as any)?.Message
    });
  }

  return error;
}

function addRequestId(ctx: Context) {
  return (options: NormalizedOptions) => {
    if (!options.headers) {
      // eslint-disable-next-line no-param-reassign
      options.headers = {};
    }
    if (ctx.id) {
      // eslint-disable-next-line no-param-reassign
      options.headers['x-request-id'] = ctx.id;
    }
  };
}

function operatorFn(client: Got, fn: ProviderOperation<any>) {
  return <TIn, TOut>(value: TIn, ctx: Context, bautajs: BautaJSInstance) => {
    const promiseOrStream = fn(
      client.extend({
        hooks: {
          beforeRequest: [addRequestId(ctx), logRequestHook(ctx.logger)],
          afterResponse: [logResponseHook(ctx.logger)],
          beforeError: [logErrorsHook(ctx.logger), addErrorStatusCode]
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
      agent: {
        http: httpAgent,
        https: httpsAgent
      },
      responseType: 'json',
      resolveBodyOnly: true,
      ...options
    });
    return operatorFn(client, fn);
  };
}

export default restProvider;
