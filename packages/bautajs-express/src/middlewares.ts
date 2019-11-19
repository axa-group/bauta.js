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
import swaggerUiExpress from 'swagger-ui-express';
import morgan from 'morgan';
import cors, { CorsOptions } from 'cors';
import { Application, json, urlencoded } from 'express';
import helmet from 'helmet';
import { Document, Operations } from '@bautajs/core';
import { OpenAPIV3, OpenAPIV2, OpenAPI } from '@bautajs/core/node_modules/openapi-types';
import { MiddlewareOption, MorganOptions, BodyParserOptions, ExplorerOptions } from './types';

function buildOpenAPIPaths(apiDefinition: OpenAPI.Document, operations: Operations) {
  const paths: OpenAPIV3.PathsObject | OpenAPIV2.PathsObject = {};

  Object.keys(operations[apiDefinition.info.version]).forEach((key: string) => {
    const operation = operations[apiDefinition.info.version][key];
    if (!paths[operation.route.path]) {
      paths[operation.route.path] = {};
    }
    paths[operation.route.path][operation.route.method.toLocaleLowerCase()] =
      operation.route.openapiSource;
  });

  return paths;
}

export function initMorgan(app: Application, opt?: MiddlewareOption<MorganOptions>) {
  if (!opt || (opt && opt.enabled === true && !opt.options)) {
    app.use(
      morgan('tiny', {
        immediate: true
      })
    );
    app.use(
      morgan('tiny', {
        immediate: false
      })
    );
  } else if (opt && opt.enabled === true && opt.options) {
    app.use(morgan(opt.options.format, opt.options.options));
    app.use(
      morgan('tiny', {
        immediate: false
      })
    );
  }
}

export function initHelmet(app: Application, opt?: MiddlewareOption<helmet.IHelmetConfiguration>) {
  if (!opt || (opt && opt.enabled === true && !opt.options)) {
    app.use(helmet());
  } else if (opt && opt.enabled === true && opt.options) {
    app.use(helmet(opt.options));
  }
}

export function initCors(app: Application, opt?: MiddlewareOption<CorsOptions>) {
  if (!opt || (opt && opt.enabled === true && !opt.options)) {
    app.use(cors());
  } else if (opt && opt.enabled === true && opt.options) {
    app.use(cors(opt.options));
  }
}

export function initBodyParser(app: Application, opt?: MiddlewareOption<BodyParserOptions>) {
  if (!opt || (opt && opt.enabled === true && !opt.options)) {
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  } else if (opt && opt.enabled === true && opt.options) {
    app.use(json(opt.options.json));
    app.use(urlencoded(opt.options.urlEncoded));
  }
}

export function initExplorer(
  app: Application,
  apiDefinitions: Document[],
  operations: Operations,
  opt?: MiddlewareOption<ExplorerOptions>
) {
  swaggerUiExpress.setup();

  if (!opt || (opt && opt.enabled === true && !opt.options)) {
    apiDefinitions.forEach(apiDefinition => {
      const openAPIPath = `/${apiDefinition.info.version}/openapi.json`;
      const paths = buildOpenAPIPaths(apiDefinition, operations);
      app.get(openAPIPath, (_, res) => {
        res.json({ ...apiDefinition, paths });
        res.end();
      });
      app.use(
        `/${apiDefinition.info.version}/explorer`,
        swaggerUiExpress.serve,
        swaggerUiExpress.setup(null, {
          url: openAPIPath
        })
      );
    });
  } else if (opt && opt.enabled === true && opt.options) {
    const opts: ExplorerOptions = opt.options;
    apiDefinitions.forEach(apiDefinition => {
      const openAPIPath = `/${apiDefinition.info.version}/openapi.json`;
      const paths = buildOpenAPIPaths(apiDefinition, operations);
      app.get(openAPIPath, (_, res) => {
        res.json({ ...apiDefinition, paths });
        res.end();
      });
      app.use(
        `/${apiDefinition.info.version}/${opts.path || 'explorer'}`,
        swaggerUiExpress.serve,
        swaggerUiExpress.setup(null, {
          ...opt,
          swaggerOptions: {
            ...(opts.swaggerOptions ? opts.swaggerOptions : {}),
            url: openAPIPath
          }
        })
      );
    });
  }
}
