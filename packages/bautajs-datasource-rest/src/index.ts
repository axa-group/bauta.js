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
  Got,
  RequestError,
  CancelableRequest,
  Response as GOTResponse
} from 'got';
import { createHttpAgent, createHttpsAgent } from 'native-proxy-agent';
import { Context, BautaJSInstance, utils, Logger, Pipeline, BautaJSOptions } from '@bautajs/core';

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
) => TOut | Promise<TOut>;
export type Provider<TOut> = <TIn>(options?: ExtendOptions) => Pipeline.StepFunction<TIn, TOut>;
export interface RestProvider {
  <TOut>(fn: ProviderOperation<TOut>): Provider<TOut>;
  extend: (options?: ExtendOptions) => RestProvider;
}

const httpAgent = createHttpAgent();
const httpsAgent = createHttpsAgent();
const isDebugLogLevel = process.env.LOG_LEVEL?.toLowerCase() === 'debug';

function logRequestHook(logger: Logger, bautaOptions: BautaJSOptions) {
  return (options: NormalizedOptions) => {
    logger.info(`request-logger: Request to [${options.method}] ${options.url}`);
    if (isDebugLogLevel) {
      const requestData: RequestLog = {
        url: options.url.toString(),
        method: options.method,
        headers: utils.prepareToLog(
          options.headers,
          bautaOptions.truncateLogSize,
          bautaOptions.disableTruncateLog
        )
      };
      if (options.body || options.json) {
        requestData.body = utils.prepareToLog(
          options.body || options.json,
          bautaOptions.truncateLogSize,
          bautaOptions.disableTruncateLog
        );
      }
      logger.debug({ requestData }, 'request-logger: Request data');
    }
  };
}
function logErrorsHook(logger: Logger, bautaOptions: BautaJSOptions) {
  return (error: RequestError) => {
    if (error.response && error.response.body) {
      // RequestError
      logger.error(
        {
          providerUrl: `[${error.options.method}] ${error.options.url}`,
          error: {
            statusCode: error.response.statusCode,
            body: utils.prepareToLog(
              error.response.body,
              bautaOptions.truncateLogSize,
              bautaOptions.disableTruncateLog
            ),
            name: error.name,
            message: error.message
          }
        },
        `response-logger: Error for [${error.options.method}] ${error.options.url}`
      );
    } else if (error.options) {
      // GenericError
      logger.error(
        {
          providerUrl: `[${error.options.method}] ${error.options.url}`,
          error: {
            name: error.name,
            code: error.code,
            message: error.message
          }
        },
        `response-logger: Error for [${error.options.method}] ${error.options.url}`
      );
    } else {
      // Unexpected Error
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
function logResponseHook(logger: Logger, bautaOptions: BautaJSOptions) {
  return (response: GOTResponse) => {
    if (response.isFromCache) {
      logger.info(`response-logger: Response for ${response.requestUrl} is cached.`);
    } else {
      if (isDebugLogLevel) {
        logger.debug(
          {
            providerUrl: `[${response.request.options.method}] ${response.requestUrl}`,
            response: {
              headers: utils.prepareToLog(
                response.headers,
                bautaOptions.truncateLogSize,
                bautaOptions.disableTruncateLog
              ),
              statusCode: response.statusCode,
              body: utils.prepareToLog(
                response.body,
                bautaOptions.truncateLogSize,
                bautaOptions.disableTruncateLog
              )
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

function addErrorStatusCodeHook(error: RequestError) {
  if (error instanceof HTTPError) {
    Object.assign(error, {
      statusCode: error.response.statusCode,
      message: (error.response.body as any)?.message || (error.response.body as any)?.Message
    });
  }

  return error;
}

function addRequestIdHook(id?: string | number) {
  return (options: NormalizedOptions) => {
    if (!options.headers) {
      // eslint-disable-next-line no-param-reassign
      options.headers = {};
    }
    if (id) {
      // eslint-disable-next-line no-param-reassign
      options.headers['x-request-id'] = `${id}`;
    }
  };
}

function operatorFn<TOut>(client: Got, fn: ProviderOperation<TOut>) {
  return <TIn>(value: TIn, ctx: Context, bautajs: BautaJSInstance) => {
    const promiseOrStream = fn(
      client.extend({
        hooks: {
          beforeRequest: [addRequestIdHook(ctx.id), logRequestHook(ctx.log, bautajs.options)],
          afterResponse: [logResponseHook(ctx.log, bautajs.options)],
          beforeError: [logErrorsHook(ctx.log, bautajs.options), addErrorStatusCodeHook]
        }
      }),
      value,
      ctx,
      bautajs
    );
    ctx.token.onCancel(() => {
      ctx.log.error(`Request was canceled`);
      if (typeof (promiseOrStream as any).cancel === 'function') {
        (promiseOrStream as CancelableRequest).cancel();
      } else if (typeof (promiseOrStream as any).destroy === 'function') {
        // Cast as Response since is not posible to now the type of TOut without creating the fn function
        (promiseOrStream as any).destroy();
      }
    });
    return promiseOrStream;
  };
}

function create(globalGotOptions?: ExtendOptions) {
  const defaultClient = got.extend({
    agent: {
      http: httpAgent,
      https: httpsAgent
    },
    responseType: 'json',
    resolveBodyOnly: true,
    ...globalGotOptions
  });

  /**
   * Create a rest provider function.
   *
   * @template TOut
   * @param {ProviderOperation<TOut>} fn
   * @returns {Provider<TOut>}
   */
  const restProvider: RestProvider = <TOut>(fn: ProviderOperation<TOut>) => {
    return (options?: ExtendOptions) => {
      const client =
        options && Object.keys(options).length > 0 ? defaultClient.extend(options) : defaultClient;
      return operatorFn(client, fn);
    };
  };

  restProvider.extend = create;

  return restProvider;
}

const restProvider = create({});

export default restProvider;
export {
  restProvider,
  logRequestHook,
  httpAgent,
  httpsAgent,
  logResponseHook,
  addRequestIdHook,
  logErrorsHook,
  addErrorStatusCodeHook
};
