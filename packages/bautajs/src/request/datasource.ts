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
import { extend as gotExtend, Response } from 'got';
import { Agent } from 'http';
import { Multipart } from 'multipart-request-builder';
import { createAgent, NativeHttpAgentOptions } from 'native-proxy-agent';
import PCancelable from 'p-cancelable';
import stjs from 'stjs';
import { LoggerBuilder } from '../logger';
import { prepareToLog } from '../utils/prepare-to-log';
import {
  Context,
  DataSourceData,
  EventTypes,
  Logger,
  NormalizedOptions,
  OperationDataSource,
  OperationDataSourceBuilder,
  OperationTemplate,
  RequestOptions,
  ResponseType
} from '../utils/types';
import { buildForm } from './form-data';

interface RequestLog {
  url: string | undefined;
  method: string | undefined;
  headers: string;
  body?: string;
}

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
          headers: prepareToLog(options.headers)
        };
        if (options.body) {
          requestData.body = prepareToLog(options.body);
        }
        log.debug(`request-logger: Request data: `, requestData);
        log.events.emit(EventTypes.DATASOURCE_REQUEST, options);
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
              headers: prepareToLog(response.headers),
              statusCode: response.statusCode,
              body: prepareToLog(response.body)
            }
          );
        }
        log.info(
          `response-logger: The request to ${response.requestUrl} took: ${
            response.timings.phases.total
          } ms`
        );
      }
      log.events.emit(EventTypes.DATASOURCE_RESPONSE, response);

      return response;
    },
    httpRequestThroughtProxy(options: RequestOptions) {
      if (options.agent && (<NativeHttpAgentOptions>options.agent).httpThroughProxy) {
        Object.assign(options, { path: options.href });
      }
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

  if (!parsedOptions.headers.connection && !parsedOptions.headers.Connection) {
    parsedOptions.headers.connection = 'keep-alive';
  }

  return parsedOptions;
}

function compileDatasource<TReq, TRes, TIn>(
  operationTemplate: OperationTemplate,
  context: Context<TReq, TRes>,
  previousValue: TIn
): OperationDataSource {
  const dataSourceData: DataSourceData<TReq, TRes, TIn> = {
    previousValue,
    ctx: context,
    env: process.env
  };
  const dataSource = stjs
    .select(dataSourceData)
    .transformWith(operationTemplate)
    .root();

  const log: Logger | undefined = context.logger;
  const hooks = requestHooks(log);
  const { cert, key, rejectUnauthorized, proxy, ...options }: RequestOptions = {
    method: dataSource.method,
    json: true,
    ...dataSource.options,
    timeout: dataSource.options && dataSource.options.timeout ? dataSource.options.timeout : 10000,
    hooks: {
      beforeRequest: [hooks.logRequest, hooks.httpRequestThroughtProxy],
      afterResponse: [hooks.logResponse, hooks.getResponseBody]
    }
  };
  // Add request id
  if (options.headers) {
    options.headers['x-request-id'] = context.id;
  } else {
    options.headers = {
      'x-request-id': context.id
    };
  }

  const { responseType, ...gotOptions } = normalizeOptions(options);
  const gotInstace = gotExtend(gotOptions);
  const request: any = (localOptions: any = {}) => {
    const { url } = dataSource;

    if (typeof url !== 'string') {
      throw new Error(
        `URL is a mandatory parameter for a datasource request on operation: ${dataSource.id}`
      );
    }
    let updateOptions: NormalizedOptions = {};
    if (Object.keys(localOptions).length > 0) {
      updateOptions = normalizeOptions(<Partial<RequestOptions>>localOptions);
    }

    const strictSSL: boolean =
      rejectUnauthorized === null || rejectUnauthorized === undefined
        ? !!localOptions.rejectUnauthorized
        : rejectUnauthorized;
    const agent: Agent = createAgent(url, {
      proxy: proxy as any,
      cert: cert || localOptions.cert,
      key: key || localOptions.key,
      rejectUnauthorized: strictSSL
    });
    // add request id
    if (updateOptions.headers) {
      updateOptions.headers['x-request-id'] = context.id;
    }

    if (localOptions.stream === true) {
      return gotInstace.stream(url, {
        agent,
        ...updateOptions
      });
    }

    if (localOptions.resolveBodyOnly === false) {
      return new PCancelable<Response<string | Buffer | object>>((resolve, reject, onCancel) => {
        const promise = gotInstace(url, {
          agent,
          ...updateOptions
        });

        onCancel(() => promise.cancel());

        promise
          .then((response: Response<string | Buffer | object>) => {
            response.body = parseBody(updateOptions.responseType || responseType, response.body);
            return response;
          })
          .then(resolve, reject);
      });
    }

    return gotInstace(url, {
      agent,
      ...updateOptions
    }).then(response => parseBody(updateOptions.responseType || responseType, response.body));
  };

  return {
    ...dataSource,
    request
  };
}

export function buildDataSource<TReq, TRes>(
  operationTemplate: OperationTemplate
): OperationDataSourceBuilder {
  const datasourceAsFn = function dataSourceFn(
    this: Context<TReq, TRes>,
    previousValue: any = null
  ): OperationDataSource {
    return compileDatasource(operationTemplate, this, previousValue);
  };

  return Object.assign(datasourceAsFn, {
    template: operationTemplate
  }) as OperationDataSourceBuilder;
}

export default buildDataSource;
