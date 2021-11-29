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
import { createHttpAgent, createHttpsAgent } from '@axa/native-proxy-agent';
import { Context, BautaJSInstance } from '@axa-group/bautajs-core';
import { reqSerializer } from './serializers/req';
import { resSerializer } from './serializers/res';
import { errSerializer } from './serializers/err';
import { ProviderOperation, RestProvider, RestProviderOptions } from './types';

const httpAgent = createHttpAgent();
const httpsAgent = createHttpsAgent();
const debugLevels = ['debug', 'trace'];

function isDebugLogLevel(level?: number | string | (() => string | number)) {
  const actualLevel = typeof level === 'function' ? level() : level;
  return (
    (typeof actualLevel === 'number' && actualLevel <= 20) ||
    (typeof actualLevel === 'string' && debugLevels.includes(actualLevel)) ||
    // fallback to LOG_LEVEL if level is not reachable
    (actualLevel === undefined &&
      process.env.LOG_LEVEL !== undefined &&
      debugLevels.includes(process.env.LOG_LEVEL))
  );
}

function logRequestHook(
  log: (...args: any[]) => void,
  restProviderOptions: RestProviderOptions,
  isDebugMode: boolean
) {
  return (options: NormalizedOptions) => {
    log(
      {
        datasourceReq: reqSerializer(options, restProviderOptions, isDebugMode)
      },
      'outgoing request'
    );
  };
}

function logErrorsHook(
  log: (...args: any[]) => void,
  restProviderOptions: RestProviderOptions,
  isDebugMode: boolean
) {
  return (error: RequestError) => {
    log(
      {
        // Do not log request headers and body on the response. This information may be logged already on the request hook
        datasourceReq: reqSerializer(error.options, restProviderOptions, false),
        datasourceErr: errSerializer(error, restProviderOptions, isDebugMode)
      },
      `outgoing request failed`
    );

    return error;
  };
}
function logResponseHook(
  log: (...args: any[]) => void,
  restProviderOptions: RestProviderOptions,
  isDebugMode: boolean
) {
  return (response: GOTResponse) => {
    if (response.statusCode > 399) {
      return response;
    }
    // Do not log request headers and body on response
    const datasourceReq = reqSerializer(response.request.options, restProviderOptions, false);
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
          datasourceRes: resSerializer(response, restProviderOptions, isDebugMode)
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
  return <TIn>(value: TIn, ctx: Context, bautajs: BautaJSInstance) => {
    const logger = ctx.log.child({
      module: '@bautajs/datasource'
    });
    const providerOptions = { ...bautajs.staticConfig, ...restProviderOptions };
    let log;
    // if log level is ignored, we set it to debug mode.
    let isDebugMode = restProviderOptions.ignoreLogLevel || false;
    if (isDebugLogLevel(logger.level)) {
      log = logger.debug.bind(logger);
      isDebugMode = true;
    } else {
      log = logger.info.bind(logger);
    }
    const promiseOrStream = fn(
      client.extend({
        hooks: {
          beforeRequest: [
            addRequestIdHook(ctx.id),
            typeof providerOptions.logHooks?.logRequestHook === 'function'
              ? providerOptions.logHooks?.logRequestHook(log, providerOptions, isDebugMode, logger)
              : logRequestHook(log, providerOptions, isDebugMode)
          ],
          afterResponse: [
            typeof providerOptions.logHooks?.logResponseHook === 'function'
              ? providerOptions.logHooks?.logResponseHook(log, providerOptions, isDebugMode, logger)
              : logResponseHook(log, providerOptions, isDebugMode)
          ],
          beforeError: [
            typeof providerOptions.logHooks?.logErrorsHook === 'function'
              ? providerOptions.logHooks?.logErrorsHook(
                  logger.error.bind(logger),
                  providerOptions,
                  isDebugMode,
                  logger
                )
              : logErrorsHook(logger.error.bind(logger), providerOptions, isDebugMode),
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
  const restProviderFn: RestProvider = <TOut>(
    fn: ProviderOperation<TOut>,
    restProviderOptions?: RestProviderOptions
  ) => {
    return (options?: ExtendOptions) => {
      const client =
        options && Object.keys(options).length > 0 ? defaultClient.extend(options) : defaultClient;
      return stepFn(client, fn, restProviderOptions);
    };
  };

  restProviderFn.extend = create;

  return restProviderFn;
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
