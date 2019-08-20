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
import callsites from 'callsites';
import deepmerge from 'deepmerge';
import { extend as gotExtend, Response } from 'got';
import { Multipart } from 'multipart-request-builder';
import { createHttpAgent, createHttpsAgent } from 'native-proxy-agent';
import PCancelable from 'p-cancelable';
import stjs from 'stjs';
import {
  BautaJSInstance,
  Context,
  ContextLogger,
  Dictionary,
  Logger,
  LoggerBuilder,
  OperatorFunction,
  utils
} from '@bautajs/core';
import { buildForm } from './form-data';
import { isMergeableObject } from './utils/is-mergeable-object';
import {
  CompiledRestProvider,
  NormalizedOptions,
  Options,
  RequestDecorator,
  RequestLog,
  RequestOptions,
  RequestParams,
  ResponseType,
  RestDataSource,
  RestDataSourceTemplate,
  RestProvider,
  RestProviderTemplate,
  OperatorFunctionCompiled,
  EventTypes
} from './utils/types';

const httpAgent = createHttpAgent();
const httpsAgent = createHttpsAgent();

function parseBody(responseType: ResponseType | undefined, body: any): string | Buffer | object {
  if (responseType === 'json') {
    return typeof body === 'object' ? body : JSON.parse(body);
  }
  if (responseType === 'buffer') {
    return Buffer.from(body);
  }
  if (responseType === null) {
    throw new Error(`Failed to parse body of type '${responseType}'`);
  }

  return body;
}

function requestHooks(log: ContextLogger = new LoggerBuilder('')): any {
  return {
    logRequest(options: RequestOptions) {
      log.info(`request-logger: Request to [${options.method}] ${options.href}`);
      if (process.env.LOG_LEVEL === 'debug') {
        const requestData: RequestLog = {
          url: options.href,
          method: options.method,
          headers: utils.prepareToLog(options.headers)
        };
        if (options.body) {
          requestData.body = utils.prepareToLog(options.body);
        }
        log.debug(`request-logger: Request data: `, requestData);
        log.events.emit(EventTypes.DATASOURCE_EXECUTION, options);
      }
    },
    logResponse(response: any) {
      if (response.fromCache) {
        log.info(`response-logger: Response for ${response.requestUrl} is cached`);
      } else {
        if (process.env.LOG_LEVEL === 'debug') {
          log.debug(
            `response-logger: Response for [${response.req.method}]  ${response.requestUrl}: `,
            {
              headers: utils.prepareToLog(response.headers),
              statusCode: response.statusCode,
              body: utils.prepareToLog(response.body)
            }
          );
        } else if (response.statusCode > 399) {
          log.error(
            `response-logger: Error for [${response.req.method}]  ${response.requestUrl}:`,
            {
              statusCode: response.statusCode,
              body: utils.prepareToLog(response.body)
            }
          );
        }
        const totalTime = response.timings.phases.total;
        log.info(`response-logger: The request to ${response.requestUrl} took: ${totalTime} ms`);
      }
      log.events.emit(EventTypes.DATASOURCE_RESULT, response);

      return response;
    }
  };
}

function normalizeOptions(options: RequestOptions): NormalizedOptions {
  const parsedOptions: RequestOptions = { ...options };

  if (!parsedOptions.headers) {
    parsedOptions.headers = {};
  }

  if (!parsedOptions.headers['user-agent']) {
    parsedOptions.headers['user-agent'] = 'bautaJS';
  }

  if (typeof options.json === 'object') {
    parsedOptions.body = options.json;
    parsedOptions.responseType = ResponseType.JSON;
    parsedOptions.json = true;
  } else if (options.json === true) {
    parsedOptions.responseType = ResponseType.JSON;
  }

  if (parsedOptions.responseType && typeof parsedOptions.responseType !== 'string') {
    parsedOptions.responseType = ResponseType.TEXT;
  } else if (parsedOptions.responseType === ResponseType.JSON) {
    parsedOptions.json = true;
  }

  if (!Array.isArray(options.form) && typeof options.form === 'object') {
    parsedOptions.body = options.form;
    parsedOptions.form = true;
  }

  if (typeof options.multipart === 'object') {
    const multipart = new Multipart({
      preambleCRLF: options.preambleCRLF,
      postambleCRLF: options.postambleCRLF
    });
    const { body, headers } = multipart.buildRequest(options.multipart);
    parsedOptions.body = body;
    parsedOptions.json = false;
    parsedOptions.responseType = ResponseType.JSON;
    parsedOptions.headers = {
      ...options.headers,
      ...headers,
      Accept: 'application/json'
    };
    delete parsedOptions.multipart;
    delete parsedOptions.preambleCRLF;
    delete parsedOptions.postambleCRLF;
  }

  if (!Array.isArray(options.formData) && typeof options.formData === 'object') {
    parsedOptions.body = buildForm(options.formData);
    parsedOptions.json = false;
    parsedOptions.responseType = ResponseType.JSON;
    parsedOptions.headers = { ...options.headers, Accept: 'application/json' };
  }

  return parsedOptions;
}

function compileDatasource(
  providerTemplate: RestProviderTemplate<RequestParams>,
  context: Context,
  incomingOptions: RequestParams
): CompiledRestProvider {
  const { url, ...options } = incomingOptions;
  // Add request id
  if (options.headers) {
    options.headers['x-request-id'] = context.id;
  } else {
    options.headers = {
      'x-request-id': context.id
    };
  }

  const { responseType, ...gotOptions } = normalizeOptions(options);
  if (url && gotOptions.agent === undefined) {
    gotOptions.agent = url.indexOf('https:') === 0 ? httpsAgent : httpAgent;
  }

  const gotInstace = gotExtend(gotOptions);
  const request: any = (localOptions: any = {}) => {
    if (typeof url !== 'string') {
      throw new Error(
        `URL is a mandatory parameter for a datasource request on operation: ${providerTemplate.id}`
      );
    }
    let updateOptions: NormalizedOptions = {};
    if (Object.keys(localOptions).length > 0) {
      updateOptions = normalizeOptions(<Partial<RequestOptions>>localOptions);
    }

    // add request id
    if (updateOptions.headers) {
      updateOptions.headers['x-request-id'] = context.id;
    }

    if (localOptions.stream === true) {
      return gotInstace.stream(url, updateOptions);
    }

    let cancelablePromise: PCancelable<any>;
    if (localOptions.resolveBodyOnly === false) {
      cancelablePromise = new PCancelable<Response<string | Buffer | object>>(
        (resolve, reject, onCancel) => {
          const promise = gotInstace(url, updateOptions);

          onCancel(() => promise.cancel());

          promise
            .then((response: Response<string | Buffer | object>) => {
              response.body = parseBody(updateOptions.responseType || responseType, response.body);
              return response;
            })
            .then(resolve, reject);
        }
      );
    } else {
      cancelablePromise = new PCancelable<string | Buffer | object>((resolve, reject, onCancel) => {
        const promise = gotInstace(url, updateOptions);
        onCancel(() => promise.cancel());
        promise
          .then(response => parseBody(updateOptions.responseType || responseType, response.body))
          .then(resolve, reject);
      });
    }

    context.token.onCancel(() => {
      context.logger.error(`Request to ${url} was canceled`);
      cancelablePromise.cancel();
    });

    return cancelablePromise;
  };

  return {
    id: providerTemplate.id,
    options: incomingOptions,
    request
  };
}

function mergeOptions(
  ctx: Context,
  logger: Logger,
  { options, globalOptions }: { options: RequestParams; globalOptions: RequestParams }
): RequestParams {
  const log: ContextLogger | Logger = ctx.logger || logger;
  const hooks = requestHooks(log);

  return deepmerge.all(
    [
      { timeout: 10000, json: true },
      globalOptions || {},
      options || {},
      {
        hooks: {
          beforeRequest: [hooks.logRequest],
          afterResponse: [hooks.logResponse]
        }
      }
    ],
    {
      isMergeableObject
    }
  ) as RequestParams;
}

function compileByTemplate<TOptions>(
  operationTemplate: RestProviderTemplate<TOptions>,
  previousValue: any,
  context: Context,
  bautajs: BautaJSInstance,
  $env: Dictionary<any>,
  globalOptions?: TOptions
): RequestParams {
  const { globalOptionsCmp, optionsCmp } = stjs
    .select({
      previousValue,
      ctx: context,
      $static: bautajs.staticConfig,
      $env
    })
    .transformWith({
      globalOptionsCmp: globalOptions,
      optionsCmp: operationTemplate.options
    })
    .root() as { globalOptionsCmp: RequestParams; optionsCmp: RequestParams };

  return mergeOptions(context, bautajs.logger, {
    options: optionsCmp,
    globalOptions: globalOptionsCmp
  });
}

function compileOptions<TOptions>(
  operationTemplate: RestProviderTemplate<TOptions>,
  previousValue: any,
  context: Context,
  bautajs: BautaJSInstance,
  $env: Dictionary<any>,
  globalOptions?: TOptions
): RequestParams {
  const optionsCmp =
    typeof operationTemplate.options === 'function'
      ? operationTemplate.options(previousValue, context, bautajs.staticConfig, $env)
      : operationTemplate.options;
  const globalOptionsCmp =
    typeof globalOptions === 'function'
      ? globalOptions(previousValue, context, bautajs.staticConfig, $env)
      : globalOptions;

  return mergeOptions(context, bautajs.logger, {
    options: optionsCmp,
    globalOptions: globalOptionsCmp
  });
}

function runner<TIn, TOut, TOptions>(
  providerTemplate: RestProviderTemplate<TOptions>,
  globalOptions?: TOptions,
  byTemplate?: boolean
) {
  return (fn: OperatorFunctionCompiled<TIn, TOut>): OperatorFunction<TIn, TOut> => {
    return (value: TIn, ctx: Context, bautajs: BautaJSInstance): Promise<TOut> | TOut => {
      let options: RequestParams;
      if (byTemplate) {
        options = compileByTemplate<TOptions>(
          providerTemplate,
          value,
          ctx,
          bautajs,
          process.env,
          globalOptions
        );
      } else {
        options = compileOptions<TOptions>(
          providerTemplate,
          value,
          ctx,
          bautajs,
          process.env,
          globalOptions
        );
      }
      return fn(value, ctx, bautajs, compileDatasource(providerTemplate, ctx, options));
    };
  };
}

function initProviderList(obj: any) {
  return new Proxy(obj, {
    get(target: Dictionary<any>, prop: string) {
      if (!Object.prototype.hasOwnProperty.call(target, prop)) {
        throw new Error(`[ERROR] Provider "${prop}" not found on ${callsites()[1].getFileName()}.`);
      }

      return target[prop];
    }
  });
}

export function restProvider<TIn, TOptions>(
  providerTemplate: RestProviderTemplate<TOptions>,
  globalOptions?: TOptions
): RestProvider<TIn> {
  const compiler = runner<TIn, any, TOptions>(providerTemplate, globalOptions, false);
  const request: RequestDecorator<TIn> = (localOptions?: any) =>
    compiler((_: any, _ctx: any, _bautajs: any, provider: any) => provider.request(localOptions));

  return Object.assign(request, { compile: compiler });
}

export function restProviderTemplate<TIn, TOptions>(
  providerTemplate: RestProviderTemplate<TOptions>,
  globalOptions?: TOptions
): RestProvider<TIn> {
  const compiler = runner<TIn, any, TOptions>(providerTemplate, globalOptions, true);
  const request: RequestDecorator<TIn> = (localOptions?: any) =>
    compiler((_: any, _ctx: any, _bautajs: any, provider: any) => provider.request(localOptions));

  return Object.assign(request, { compile: compiler });
}

export function restDataSource<TIn>(
  dsTemplate: RestDataSourceTemplate<Options<TIn, RequestParams>>
): RestDataSource<TIn> {
  const result: RestDataSource<TIn> = initProviderList({});

  dsTemplate.providers.forEach(provider => {
    result[provider.id] = restProvider<TIn, Options<TIn, RequestParams>>(
      provider,
      dsTemplate.options
    );
  });

  return result;
}

export function restDataSourceTemplate<TIn>(
  dsTemplate: RestDataSourceTemplate<RequestParams>
): RestDataSource<TIn> {
  const result: RestDataSource<TIn> = initProviderList({});

  dsTemplate.providers.forEach(provider => {
    result[provider.id] = restProviderTemplate<TIn, RequestParams>(provider, dsTemplate.options);
  });

  return result;
}
export default restDataSource;
