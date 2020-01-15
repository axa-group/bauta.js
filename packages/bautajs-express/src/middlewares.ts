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
        swaggerUiExpress.setup(undefined, {
          swaggerUrl: openAPIPath
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
        swaggerUiExpress.setup(undefined, {
          ...opt,
          swaggerUrl: openAPIPath
        })
      );
    });
  }
}
