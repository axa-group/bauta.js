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
import deepmerge from 'deepmerge';
import { extend as gotExtend, Response } from 'got';
import { Multipart } from 'multipart-request-builder';
import { createHttpAgent, createHttpsAgent } from 'native-proxy-agent';
import PCancelable from 'p-cancelable';
import stjs from 'stjs';
import {
  Context,
  DataSourceTemplate,
  Dictionary,
  EventTypes,
  Logger,
  LoggerBuilder,
  OperationTemplate,
  utils
} from '@bautajs/core';
import { buildForm } from './form-data';
import {
  NormalizedOptions,
  Options,
  RequestOptions,
  RequestParams,
  ResponseType,
  RestDataSourceTemplate,
  RestOperation,
  RestOperationTemplate
} from './utils/types';

interface RequestLog {
  url: string | undefined;
  method: string | undefined;
  headers: string;
  body?: string;
}

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

function requestHooks(log: Logger = new LoggerBuilder('')): any {
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

function compileDatasource<TIn>(
  operationTemplate: RestOperationTemplate<TIn>,
  context: Context,
  incomingOptions: RequestParams
): RestOperation {
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
        `URL is a mandatory parameter for a datasource request on operation: ${operationTemplate.id}`
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

    if (localOptions.resolveBodyOnly === false) {
      return new PCancelable<Response<string | Buffer | object>>((resolve, reject, onCancel) => {
        const promise = gotInstace(url, updateOptions);

        onCancel(() => promise.cancel());

        promise
          .then((response: Response<string | Buffer | object>) => {
            response.body = parseBody(updateOptions.responseType || responseType, response.body);
            return response;
          })
          .then(resolve, reject);
      });
    }

    return gotInstace(url, updateOptions).then(response =>
      parseBody(updateOptions.responseType || responseType, response.body)
    );
  };

  return {
    ...operationTemplate,
    options: incomingOptions,
    request
  };
}

function mergeOptions(
  ctx: Context,
  { options, globalOptions }: { options: RequestParams; globalOptions: RequestParams }
): RequestParams {
  const log: Logger | undefined = ctx.logger;
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
      isMergeableObject: utils.isMergeableObject
    }
  ) as RequestParams;
}

function compileByTemplate<TOptions>(
  operationTemplate: RestOperationTemplate<TOptions>,
  previousValue: any,
  context: Context,
  $static: any,
  $env: Dictionary<any>,
  globalOptions?: TOptions
): RequestParams {
  const { globalOptionsCmp, optionsCmp } = stjs
    .select({
      previousValue,
      ctx: context,
      $static,
      $env
    })
    .transformWith({
      globalOptionsCmp: globalOptions,
      optionsCmp: operationTemplate.options
    })
    .root() as { globalOptionsCmp: RequestParams; optionsCmp: RequestParams };

  return mergeOptions(context, { options: optionsCmp, globalOptions: globalOptionsCmp });
}

function compileOptions<TOptions>(
  operationTemplate: RestOperationTemplate<TOptions>,
  previousValue: any,
  context: Context,
  $static: any,
  $env: Dictionary<any>,
  globalOptions?: TOptions
): RequestParams {
  const optionsCmp =
    typeof operationTemplate.options === 'function'
      ? operationTemplate.options(previousValue, context, $static, $env)
      : operationTemplate.options;
  const globalOptionsCmp =
    typeof globalOptions === 'function'
      ? globalOptions(previousValue, context, $static, $env)
      : globalOptions;

  return mergeOptions(context, { options: optionsCmp, globalOptions: globalOptionsCmp });
}

function runner<TIn, TOptions>(
  operationTemplate: RestOperationTemplate<TOptions>,
  globalOptions?: TOptions,
  byTemplate: boolean = false
) {
  return (value: TIn, ctx: Context, $env: Dictionary<any>, $static?: any) => {
    let options: RequestParams;
    if (byTemplate) {
      options = compileByTemplate<TOptions>(
        operationTemplate,
        value,
        ctx,
        $static,
        $env,
        globalOptions
      );
    } else {
      options = compileOptions<TOptions>(
        operationTemplate,
        value,
        ctx,
        $static,
        $env,
        globalOptions
      );
    }

    return compileDatasource(operationTemplate, ctx, options);
  };
}

export function restOperation<TIn, TOptions>(
  operationTemplate: RestOperationTemplate<TOptions>,
  globalOptions?: TOptions
): OperationTemplate<TIn, RestOperation> {
  return {
    id: operationTemplate.id,
    version: operationTemplate.version,
    private: operationTemplate.private,
    inherit: operationTemplate.inherit,
    runner: runner<TIn, TOptions>(operationTemplate, globalOptions)
  };
}

export function restOperationTemplate<TIn, TOptions>(
  operationTemplate: RestOperationTemplate<RequestParams>,
  globalOptions?: TOptions
): OperationTemplate<TIn, RestOperation> {
  return {
    id: operationTemplate.id,
    version: operationTemplate.version,
    private: operationTemplate.private,
    inherit: operationTemplate.inherit,
    runner: runner<TIn, RequestParams>(operationTemplate, globalOptions, true)
  };
}

export function restDataSource<TIn>(
  dsTemplate: RestDataSourceTemplate<Options<TIn, RequestParams>>
): DataSourceTemplate<TIn> {
  const result: DataSourceTemplate<TIn> = { services: {} };
  Object.keys(dsTemplate.services).forEach(service => {
    result.services[service] = {
      operations: dsTemplate.services[service].operations.map(op =>
        restOperation<TIn, Options<TIn, RequestParams>>(op, dsTemplate.services[service].options)
      )
    };
  });

  return result;
}

export function restDataSourceTemplate<TIn>(
  dsTemplate: RestDataSourceTemplate<RequestParams>
): DataSourceTemplate<TIn> {
  const result: DataSourceTemplate<TIn> = { services: {} };

  Object.keys(dsTemplate.services).forEach(service => {
    result.services[service] = {
      operations: dsTemplate.services[service].operations.map(op =>
        restOperationTemplate<TIn, RequestParams>(op, dsTemplate.services[service].options)
      )
    };
  });

  return result;
}
export default restDataSource;
