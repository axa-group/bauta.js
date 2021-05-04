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
import swaggerUiExpress from 'swagger-ui-express';
import morgan from 'morgan';
import cors, { CorsOptions } from 'cors';
import { json, Router, urlencoded } from 'express';
import helmet from 'helmet';
import { Document, Operations, Logger } from '@bautajs/core';
import { OpenAPIV3, OpenAPIV2, OpenAPI } from '@bautajs/core/node_modules/openapi-types';
import fastSafeStringify from 'fast-safe-stringify';

import { MiddlewareOption, MorganOptions, BodyParserOptions, ExplorerOptions } from './types';
import { genReqId } from './utils';

const morganJson = require('morgan-json');

function buildOpenAPIPaths(apiDefinition: OpenAPI.Document, operations: Operations) {
  const paths: OpenAPIV3.PathsObject | OpenAPIV2.PathsObject = {};

  Object.keys(operations[apiDefinition.info.version]).forEach((key: string) => {
    const operation = operations[apiDefinition.info.version][key];
    if (operation.route && operation.isSetup()) {
      if (!paths[operation.route.path]) {
        paths[operation.route?.path] = {};
      }
      paths[operation.route?.path][operation.route?.method.toLowerCase()] =
        operation.route?.openapiSource;
    }
  });

  return paths;
}

export function initReqIdGenerator(router: Router, logger: Logger, opt?: MiddlewareOption<null>) {
  if (!opt || (opt && opt.enabled === true)) {
    router.use((req: any, _, next) => {
      const { headers } = req;
      req.id = genReqId(headers);
      req.log = logger.child({
        url: req.url,
        reqId: req.id
      });
      next();
    });
  }
}

export function initMorgan(router: Router, opt?: MiddlewareOption<MorganOptions>) {
  morgan.token('reqId', (req: any) => req.id);

  const tinyWithTimestampAndreqId = morganJson({
    date: ':date[iso]',
    reqId: ':reqId',
    method: ':method',
    url: ':url',
    status: ':status',
    length: ':res[content-length]',
    'response-time': ':response-time ms'
  });

  if (!opt || (opt && opt.enabled === true && !opt.options)) {
    router.use(
      morgan(tinyWithTimestampAndreqId, {
        immediate: true
      })
    );
    router.use(
      morgan(tinyWithTimestampAndreqId, {
        immediate: false
      })
    );
  } else if (opt && opt.enabled === true && opt.options) {
    router.use(morgan(opt.options.format, opt.options.options));
    router.use(
      morgan(tinyWithTimestampAndreqId, {
        immediate: false
      })
    );
  }
}

export function initHelmet(router: Router, opt?: MiddlewareOption<helmet.IHelmetConfiguration>) {
  if (!opt || (opt && opt.enabled === true && !opt.options)) {
    router.use(helmet());
  } else if (opt && opt.enabled === true && opt.options) {
    router.use(helmet(opt.options));
  }
}

export function initCors(router: Router, opt?: MiddlewareOption<CorsOptions>) {
  if (!opt || (opt && opt.enabled === true && !opt.options)) {
    router.use(cors());
  } else if (opt && opt.enabled === true && opt.options) {
    router.use(cors(opt.options));
  }
}

export function initBodyParser(router: Router, opt?: MiddlewareOption<BodyParserOptions>) {
  if (!opt || (opt && opt.enabled === true && !opt.options)) {
    router.use(json({ limit: '50mb' }));
    router.use(urlencoded({ extended: true, limit: '50mb' }));
  } else if (opt && opt.enabled === true && opt.options) {
    router.use(json(opt.options.json));
    router.use(urlencoded(opt.options.urlEncoded));
  }
}

export function initExplorer(
  router: Router,
  apiDefinitions: Document[],
  operations: Operations,
  opt?: MiddlewareOption<ExplorerOptions>
) {
  swaggerUiExpress.setup();

  const swaggerEnabled: Boolean = !opt || opt.enabled === true;
  const opts: ExplorerOptions | undefined = opt?.options;
  const path: String = opts?.path || 'explorer';

  if (swaggerEnabled) {
    apiDefinitions.forEach(apiDefinition => {
      const openAPIPath = `/${apiDefinition.info.version}/openapi.json`;
      const paths = buildOpenAPIPaths(apiDefinition, operations);
      router.get(openAPIPath, (_, res) => {
        res.send(fastSafeStringify({ ...apiDefinition, paths }));
        res.end();
      });
      router.use(
        `/${apiDefinition.info.version}/${path}`,
        swaggerUiExpress.serve,
        swaggerUiExpress.setup(undefined, {
          ...(opt || null),
          swaggerUrl: openAPIPath
        })
      );
    });
  }
}
