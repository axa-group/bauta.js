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
import { Document, Operations, Logger, PathsObject } from '@bautajs/core';
import fastSafeStringify from 'fast-safe-stringify';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';

import {
  MiddlewareOption,
  MorganOptions,
  BodyParserOptions,
  ExplorerOptions,
  HelmetOptions
} from './types';
import { genReqId } from './utils';

const morganJson = require('morgan-json');

function buildOpenAPIPaths(operations: Operations) {
  const paths: PathsObject = {};
  const tags: string[] = [];

  Object.keys(operations).forEach((key: string) => {
    const operation = operations[key];
    if (operation.route && operation.isSetup()) {
      if (!paths[operation.route.path]) {
        paths[operation.route.path] = {};
      }
      if (operation.route.openapiSource.tags) {
        tags.push(...operation.route.openapiSource.tags);
      }
      const pathItem = paths[operation.route.path];
      if (pathItem) {
        pathItem[operation.route.method.toLowerCase() as OpenAPIV2.HttpMethods] =
          operation.route.openapiSource;
      }
    }
  });

  return { paths, tags };
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

export function initHelmet(router: Router, opt?: MiddlewareOption<HelmetOptions>) {
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
  apiDefinition: Document,
  operations: Operations,
  basePath?: string,
  opt?: MiddlewareOption<ExplorerOptions>
) {
  swaggerUiExpress.setup();

  const swaggerEnabled: Boolean = !opt || opt.enabled === true;
  const opts: ExplorerOptions | undefined = opt?.options;
  const path: String = opts?.path || 'explorer';

  if (swaggerEnabled) {
    const openAPIPath = `/openapi.json`;
    const { paths, tags } = buildOpenAPIPaths(operations);
    const availableTags = apiDefinition.tags?.filter((t: OpenAPIV3.TagObject) =>
      tags.includes(t.name)
    );
    router.get(openAPIPath, (_, res) => {
      res.send(fastSafeStringify({ ...apiDefinition, paths, tags: availableTags }));
      res.end();
    });
    router.use(
      `/${path}`,
      swaggerUiExpress.serve,
      swaggerUiExpress.setup(undefined, {
        ...(opt || null),
        swaggerUrl: `${basePath || ''}${openAPIPath}`
      })
    );
  }
}
