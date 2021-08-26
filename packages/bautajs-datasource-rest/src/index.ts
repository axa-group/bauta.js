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
import { Context, BautaJSInstance } from '@bautajs/core';
import { reqSerializer } from './serializers/req';
import { resSerializer } from './serializers/res';
import { errSerializer } from './serializers/err';
import { ProviderOperation, RestProvider, RestProviderOptions } from './types';

const httpAgent = createHttpAgent();
const httpsAgent = createHttpsAgent();
const isDebugLogLevel = process.env.LOG_LEVEL?.toLowerCase() === 'debug';
function logRequestHook(
  log: (...args: any[]) => void,
  restProviderOptions: RestProviderOptions,
  logAll: boolean
) {
  return (options: NormalizedOptions) => {
    log(
      {
        datasourceReq: reqSerializer(options, logAll, restProviderOptions)
      },
      'outgoing request'
    );
  };
}

function logErrorsHook(
  log: (...args: any[]) => void,
  restProviderOptions: RestProviderOptions,
  logAll: boolean
) {
  return (error: RequestError) => {
    log(
      {
        // Do not log request headers and body on the response. This information may be logged already on the request hook
        datasourceReq: reqSerializer(error.options, false, restProviderOptions),
        datasourceErr: errSerializer(error, logAll, restProviderOptions)
      },
      `outgoing request failed`
    );

    return error;
  };
}
function logResponseHook(
  log: (...args: any[]) => void,
  restProviderOptions: RestProviderOptions,
  logAll: boolean
) {
  return (response: GOTResponse) => {
    if (response.statusCode > 399) {
      return response;
    }
    // Do not log request headers and body on response
    const datasourceReq = reqSerializer(response.request.options, false, restProviderOptions);
    if (response.isFromCache) {
      log(
        {
          datasourceReq
        },
        `outgoing request is cached.`
      );
    } else {
      log(
        {
          datasourceReq,
          datasourceRes: resSerializer(response, logAll, restProviderOptions)
        },
        `outgoing request completed`
      );
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
function stepFn<TOut>(
  client: Got,
  fn: ProviderOperation<TOut>,
  restProviderOptions: RestProviderOptions = {}
) {
  const logAll = isDebugLogLevel || restProviderOptions.ignoreLogLevel === true;
  return <TIn>(value: TIn, ctx: Context, bautajs: BautaJSInstance) => {
    const logger = ctx.log.child({
      module: '@bautajs/datasource'
    });
    const log = isDebugLogLevel ? logger.debug.bind(logger) : logger.info.bind(logger);
    const promiseOrStream = fn(
      client.extend({
        hooks: {
          beforeRequest: [
            addRequestIdHook(ctx.id),
            typeof restProviderOptions.logHooks?.logRequestHook === 'function'
              ? restProviderOptions.logHooks?.logRequestHook(
                  log,
                  restProviderOptions,
                  logAll,
                  logger
                )
              : logRequestHook(log, restProviderOptions, logAll)
          ],
          afterResponse: [
            typeof restProviderOptions.logHooks?.logResponseHook === 'function'
              ? restProviderOptions.logHooks?.logResponseHook(
                  log,
                  restProviderOptions,
                  logAll,
                  logger
                )
              : logResponseHook(log, restProviderOptions, logAll)
          ],
          beforeError: [
            typeof restProviderOptions.logHooks?.logErrorsHook === 'function'
              ? restProviderOptions.logHooks?.logErrorsHook(
                  logger.error.bind(logger),
                  restProviderOptions,
                  logAll,
                  logger
                )
              : logErrorsHook(logger.error.bind(logger), restProviderOptions, logAll),
            addErrorStatusCodeHook
          ]
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
   * @param {RestProviderOptions} restProviderOptions
   * @returns {Provider<TOut>}
   */
  const restProvider: RestProvider = <TOut>(
    fn: ProviderOperation<TOut>,
    restProviderOptions?: RestProviderOptions
  ) => {
    return (options?: ExtendOptions) => {
      const client =
        options && Object.keys(options).length > 0 ? defaultClient.extend(options) : defaultClient;
      return stepFn(client, fn, restProviderOptions);
    };
  };

  restProvider.extend = create;

  return restProvider;
}

const restProvider = create({});

export default restProvider;
export {
  reqSerializer,
  resSerializer,
  errSerializer,
  restProvider,
  logRequestHook,
  httpAgent,
  httpsAgent,
  logResponseHook,
  addRequestIdHook,
  logErrorsHook,
  addErrorStatusCodeHook
};
export * from './types';
