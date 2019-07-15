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
const STJS = require('stjs');
const got = require('got');
const { Multipart } = require('multipart-request-builder');
const prepareToLog = require('../utils/prepare-to-log');
const sessionFactory = require('../session-factory');
const buildForm = require('./form-data');
const { createAgent } = require('./agent');

// waiting for GOT 5.0
function parseBody(responseType, body) {
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
        log.events.emit(log.eventTypes.DATASOURCE_REQUEST, options);
      }
    },
    logResponse(response) {
      if (response.fromCache) {
        log.info(`request-logger: Response for ${response.requestUrl} is cached`);
      } else {
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
          `request-logger: The request to ${response.requestUrl} took: ${response.timings.phases.total} ms`
        );
      }
      log.events.emit(log.eventTypes.DATASOURCE_RESPONSE, response);

      return response;
    }
  };
}

function normalizeOptions(options) {
  const parsedOptions = { ...options };

  if (!parsedOptions.headers) {
    parsedOptions.headers = {};
  }

  if (!parsedOptions['user-agent']) {
    parsedOptions.headers['user-agent'] = 'bautaJS';
  }

  if (typeof options.json === 'object') {
    parsedOptions.body = options.json;
    parsedOptions.responseType = 'json';
  } else if (options.json === true) {
    parsedOptions.responseType = 'json';
  }

  if (parsedOptions.responseType && typeof parsedOptions.responseType !== 'string') {
    parsedOptions.responseType = 'text';
  } else if (parsedOptions.responseType === 'json') {
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
    parsedOptions.responseType = 'json';
    parsedOptions.headers = { ...options.headers, ...headers, Accept: 'application/json' };
  }

  if (!Array.isArray(options.formData) && typeof options.formData === 'object') {
    parsedOptions.body = buildForm(options.formData);
    parsedOptions.json = false;
    parsedOptions.responseType = 'json';
    parsedOptions.headers = { ...options.headers, Accept: 'application/json' };
  }

  return parsedOptions;
}

function compileDatasource(dataSourceTemplate, context) {
  const dataSource = STJS.select({
    ctx: context,
    env: process.env
  })
    .transformWith(dataSourceTemplate)
    .root();

  const log = context.logger ? context.logger : sessionFactory(context).logger;
  const hooks = requestHooks(log);
  const { cert, key, rejectUnauthorized, proxy, keepAliveMsecs, keepAlive, ...options } = {
    method: dataSource.method,
    json: true,
    ...dataSource.options,
    timeout:
      dataSource.options && dataSource.options.timeout
        ? parseInt(dataSource.options.timeout, 10)
        : 10000,
    hooks: {
      beforeRequest: [hooks.logRequest],
      afterResponse: [hooks.logResponse, hooks.getResponseBody]
    }
  };
  const initOptions = normalizeOptions(options);
  const gotInstace = got.extend(initOptions);

  return {
    ...dataSource,
    request: (params = {}) => {
      const url = !params.url ? dataSource.url : params.url;

      if (typeof url !== 'string') {
        throw new Error(
          `URL is a mandatory parameter for a datasource request on operation: ${dataSource.id}`
        );
      }
      let updateOptions = {
        headers: {}
      };
      if (Object.keys(params).length > 0) {
        updateOptions = normalizeOptions(params);
      }

      let keepAliveToggle = true;
      if (keepAlive !== undefined) {
        keepAliveToggle = keepAlive;
      }
      if (params.keepAlive !== undefined) {
        keepAliveToggle = params.keepAlive;
      }

      const strictSSL =
        rejectUnauthorized === null || rejectUnauthorized === undefined
          ? !!params.rejectUnauthorized
          : rejectUnauthorized;
      const agent = createAgent(url, {
        cert: cert || params.cert,
        key: key || params.key,
        rejectUnauthorized: strictSSL,
        proxy,
        keepAliveMsecs: keepAliveMsecs || params.keepAliveMsecs,
        keepAlive: keepAliveToggle
      });

      // add request id
      updateOptions.headers['x-request-id'] = context.id;

      // GOT 10 will include this
      if (updateOptions.stram === true || initOptions.stream === true) {
        return gotInstace(url, { agent, ...updateOptions });
      }

      // GOT 10 will include this
      return gotInstace(url, { agent, ...updateOptions }).then(response => {
        if (
          updateOptions.resolveBodyOnly === true ||
          initOptions.resolveBodyOnly === true ||
          (updateOptions.resolveBodyOnly === undefined && initOptions.resolveBodyOnly === undefined)
        ) {
          return parseBody(updateOptions.responseType || initOptions.responseType, response.body);
        }

        return {
          ...response,
          body: parseBody(updateOptions.responseType || initOptions.responseType, response.body)
        };
      });
    }
  };
}

module.exports = function buildDataSource(dataSourceTemplate) {
  const datasourceAsFn = context => compileDatasource(dataSourceTemplate, context);

  return Object.assign(datasourceAsFn, { template: dataSourceTemplate });
};
