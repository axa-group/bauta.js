/*
 * Copyright (c) 2018 AXA Shared Services Spain S.A.
 *
 * Licensed under the MyAXA inner-source License (the "License");
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
const parse = require('json-templates');
const got = require('got');
const createAgent = require('native-proxy-agent');
const Multipart = require('multipart-request-builder');
const { prepareToLog } = require('../utils');
const store = require('../store');
const logger = require('../logger');
const buildForm = require('./form-data');

function requestHooks(log) {
  return {
    logRequest(options) {
      log.info(`request-logger: Request to [${options.method}] ${options.href}`);
      if (process.env.LOG_LEVEL === 'debug') {
        const requestData = {
          url: options.href,
          method: options.method,
          headers: prepareToLog(options.headers)
        };
        if (options.body) {
          requestData.body = prepareToLog(options.body);
        }
        log.debug(`request-logger: Request data: `, requestData);
      }
    },
    logResponse(response) {
      if (process.env.LOG_LEVEL === 'debug') {
        log.debug(
          `request-logger: Response for [${response.req.method}]  ${response.requestUrl}: `,
          {
            headers: prepareToLog(response.headers),
            statusCode: response.statusCode,
            body: prepareToLog(response.body)
          }
        );
      }
      log.info(
        `request-logger: The request to ${response.requestUrl} taked: ${
          response.timings.phases.total
        } ms`
      );

      return response;
    },
    httpRequestThroughtProxy(options) {
      if (options.agent.options.httpThroughProxy) {
        Object.assign(options, { path: options.href });
      }
    }
  };
}

function normalizeOptions(options) {
  const parsedOptions = options;

  if (!parsedOptions.headers) {
    parsedOptions.headers = {};
  }

  if (typeof options.json === 'object') {
    parsedOptions.body = options.json;
    parsedOptions.json = true;
  }

  if (!Array.isArray(options.form) && typeof options.form === 'object') {
    parsedOptions.body = options.form;
    parsedOptions.form = true;
  }

  if (typeof options.multipart === 'object') {
    const multipart = new Multipart(options);
    const { body, headers } = multipart.buildRequest(options.multipart);
    parsedOptions.body = body;
    parsedOptions.json = false;
    parsedOptions.headers = { ...options.headers, ...headers, Accept: 'application/json' };
  }

  if (!Array.isArray(options.formData) && typeof options.formData === 'object') {
    parsedOptions.body = buildForm(options.formData);
    parsedOptions.json = false;
    parsedOptions.headers = { ...options.headers, Accept: 'application/json' };
  }

  if (!parsedOptions.headers.connection && !parsedOptions.headers.Connection) {
    parsedOptions.headers.connection = 'keep-alive';
  }

  return parsedOptions;
}

function compileDatasource(dataSourceTemplate, context) {
  const dataSource = dataSourceTemplate({
    req: context,
    config: store.get('config'),
    env: process.env
  });
  const log = context.logger || logger.log;
  const hooks = requestHooks(log);
  const { cert, key, rejectUnauthorized, proxy, ...options } = {
    method: dataSource.method,
    json: true,
    ...dataSource.options,
    timeout:
      dataSource.options && dataSource.options.timeout
        ? parseInt(dataSource.options.timeout, 10)
        : 10000,
    hooks: {
      beforeRequest: [hooks.logRequest, hooks.httpRequestThroughtProxy],
      afterResponse: [hooks.logResponse, hooks.getResponseBody]
    }
  };
  const gotInstace = got.extend(normalizeOptions(options));

  return {
    ...dataSource,
    request: (params = {}) => {
      const url = !params.url ? dataSource.url : params.url;
      if (!url) {
        throw new Error(
          `URL is a mandatory parameter for a datasource request on operation: ${dataSource.name}`
        );
      }

      const mergedOptions = normalizeOptions(params);
      const strictSSL =
        rejectUnauthorized === null || rejectUnauthorized === undefined
          ? !!params.rejectUnauthorized
          : rejectUnauthorized;
      const agent = createAgent(url, {
        cert: cert || params.cert,
        key: key || params.key,
        rejectUnauthorized: strictSSL,
        proxy
      });

      return gotInstace(url, { agent, ...mergedOptions }).then(response => {
        // Allow to get the full response of the request
        if (dataSource.fullResponse === true) {
          return response;
        }

        // Got don't allow parse JSON response using stream request body (multipart). The json parse should be done manually.
        if (
          typeof response.body !== 'object' &&
          dataSource.options &&
          dataSource.options.json !== false
        ) {
          let res = {};
          try {
            res = JSON.parse(response.body);
          } catch (e) {
            log.error(
              `request-logger: The response for ${response.requestUrl} could not be parsed as JSON`
            );
          }

          return res;
        }

        return response.body;
      });
    }
  };
}

module.exports = function buildDataSource(dataSourceTemplate) {
  const parsedDatasource = parse(dataSourceTemplate);
  const datasourceAsFn = context => compileDatasource(parsedDatasource, context);

  return Object.assign(datasourceAsFn, { template: dataSourceTemplate });
};
