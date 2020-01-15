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
  EventTypes,
  RequestParamsTemplate,
  RequestOptionsTemplate
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
  { options, globalOptions }: { options: RequestParams; globalOptions?: RequestOptions }
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

function compileByTemplate(
  operationTemplate: RestProviderTemplate<RequestParams>,
  previousValue: any,
  context: Context,
  bautajs: BautaJSInstance,
  $env: Dictionary<any>,
  globalOptions?: RequestOptions
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

function compileOptions<TIn>(
  operationTemplate: RestProviderTemplate<Options<TIn, RequestParams>>,
  previousValue: any,
  context: Context,
  bautajs: BautaJSInstance,
  $env: Dictionary<any>,
  globalOptions?: Options<TIn, RequestOptions>
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

function runner<TIn, TOut, TOptions, TGeneralOptions>(
  providerTemplate: RestProviderTemplate<TOptions>,
  globalOptions?: TGeneralOptions,
  byTemplate?: boolean
) {
  return (fn: OperatorFunctionCompiled<TIn, TOut>): OperatorFunction<TIn, TOut> => {
    return (value: TIn, ctx: Context, bautajs: BautaJSInstance): Promise<TOut> | TOut => {
      let options: RequestParams;
      if (byTemplate) {
        options = compileByTemplate(
          providerTemplate,
          value,
          ctx,
          bautajs,
          process.env,
          globalOptions
        );
      } else {
        options = compileOptions<TIn>(
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

export function restProvider<TIn>(
  providerTemplate: RestProviderTemplate<Options<TIn, RequestParams>>,
  globalOptions?: Options<TIn, RequestOptions>
): RestProvider<TIn> {
  const compiler = runner<TIn, any, Options<TIn, RequestParams>, Options<TIn, RequestOptions>>(
    providerTemplate,
    globalOptions,
    false
  );
  const request: RequestDecorator<TIn> = (localOptions?: any) =>
    compiler((_: TIn, _ctx: any, _bautajs: any, provider: any) => provider.request(localOptions));

  return Object.assign(request, { compile: compiler });
}

/**
 * Generates one provider datasource from a stjs template {@link https://github.com/SelectTransform/st.js/ |stjs}.
 *
 * @template TIn
 * @param providerTemplate
 * @param template with global options
 * @returns the generated provider datasource
 * @deprecated better use restProvider
 */
export function restProviderTemplate<TIn>(
  providerTemplate: RestProviderTemplate<RequestParamsTemplate>,
  globalOptions?: RequestOptionsTemplate
): RestProvider<TIn> {
  const compiler = runner<TIn, any, RequestParamsTemplate, RequestOptionsTemplate>(
    providerTemplate,
    globalOptions,
    true
  );
  const request: RequestDecorator<TIn> = (localOptions?: any) =>
    compiler((_: any, _ctx: any, _bautajs: any, provider: any) => provider.request(localOptions));

  return Object.assign(request, { compile: compiler });
}

export function restDataSource<TIn>(
  dsTemplate: RestDataSourceTemplate<Options<TIn, RequestParams>, Options<TIn, RequestOptions>>
): RestDataSource<TIn> {
  const result: RestDataSource<TIn> = initProviderList({});

  dsTemplate.providers.forEach(provider => {
    result[provider.id] = restProvider<TIn>(
      { options: {}, ...provider } as RestProviderTemplate<TIn>,
      dsTemplate.options
    );
  });

  return result;
}
/**
 * Generates a list of rest of provider datasources from a stjs template {@link https://github.com/SelectTransform/st.js/ |stjs}.
 *
 * @template TIn
 * @param dsTemplate
 * @returns the generated provider datasources
 * @deprecated better use restDataSource
 */
export function restDataSourceTemplate<TIn>(
  dsTemplate: RestDataSourceTemplate<RequestParamsTemplate, RequestOptionsTemplate>
): RestDataSource<TIn> {
  const result: RestDataSource<TIn> = initProviderList({});

  dsTemplate.providers.forEach(provider => {
    result[provider.id] = restProviderTemplate<TIn>(
      { options: {}, ...provider } as RestProviderTemplate<TIn>,
      dsTemplate.options
    );
  });

  return result;
}
export default restDataSource;
