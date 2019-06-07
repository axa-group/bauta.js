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
import bodyParser from 'body-parser';
import chalk from 'chalk';
import compression from 'compression';
import cors, { CorsOptions } from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import http from 'http';
import https from 'https';
import morgan from 'morgan';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import routeOrder from 'route-order';
import swaggerUiExpress from 'swagger-ui-express';
import {
  BautaJS,
  BautaJSOptions,
  Dictionary,
  Document,
  EventTypes,
  ICallback,
  OpenAPIV2Document,
  OpenAPIV3Document,
  Operation,
  PathsObject,
  Pipeline,
  Resolver,
  StepFn
} from '@bautajs/core';

swaggerUiExpress.setup();

type SwaggerGenericOptions = string | false | null;
interface SwaggerUiOptions {
  [key: string]: any;
}
interface SwaggerOptions {
  [key: string]: any;
}

export interface Route<TReq, TRes> {
  operation: Operation<TReq, TRes>;
  responses: OpenAPIV3.ResponsesObject | OpenAPIV2.ResponsesObject;
  produces: OpenAPIV2.MimeTypes;
}

export interface MiddlewareOption<T> {
  enabled: boolean;
  options?: T;
}

export interface MiddlewareOptions {
  cors?: MiddlewareOption<CorsOptions>;
  bodyParser?: {
    enabled: boolean;
    options?: {
      json?: bodyParser.OptionsJson;
      urlEncoded?: bodyParser.OptionsUrlencoded;
    };
  };
  helmet?: MiddlewareOption<helmet.IHelmetConfiguration>;
  morgan?: {
    enabled: boolean;
    options?: {
      format: morgan.FormatFn;
      options?: morgan.Options;
    };
  };
  explorer?: {
    enabled: boolean;
    options?: {
      path?: string;
      opts?: false | SwaggerUiOptions | null | undefined;
      options?: SwaggerOptions | undefined;
      customCss?: SwaggerGenericOptions;
      customfavIcon?: SwaggerGenericOptions;
      swaggerUrl?: SwaggerGenericOptions;
      customeSiteTitle?: SwaggerGenericOptions;
    };
  };
}

const logFormat =
  ':method :url. Main headers: Time-Zone::req[Time-Zone], Accept-Language::req[Accept-Language]';

function toExpressParams(part: string) {
  return part.replace(/\{([^}]+)}/g, ':$1');
}

function getSchemaData(schema: PathsObject) {
  const swaggerPath = Object.keys(schema)[0];
  const expressRoute = swaggerPath
    .substring(1)
    .split('/')
    .map(toExpressParams)
    .join('/');

  const method = Object.keys(schema[swaggerPath])[0];
  const { responses, produces } = schema[swaggerPath][method];
  return { expressRoute, method, responses, produces, swaggerPath };
}

/**
 * Create an Express server using the BautaJS library with almost 0 configuration
 * @export
 * @class BautaJSExpress
 * @param {Document[]} apiDefinitions
 * @param {BautaJSOptions<Request, Response>} options
 * @extends {BautaJS<Request, Response>}
 * @example
 * const { BautaJSExpress } = require('@bauta/express');
 * const apiDefinition from'../../api-definition.json');
 *
 * const bautJSExpress = new BautaJSExpress(apiDefinition, {});
 * bautJSExpress.applyMiddlewares();
 * bautaJS.listen();
 */
export class BautaJSExpress extends BautaJS<Request, Response> {
  private routes: Dictionary<Dictionary<Route<Request, Response>>> = {};

  /**
   * @type {Application}
   * @memberof BautaJSExpress
   */
  public app: Application;

  constructor(apiDefinitions: Document[], options: BautaJSOptions<Request, Response>) {
    super(apiDefinitions, options);
    this.app = express();
  }

  private addRoute(expressRoute: string) {
    Object.keys(this.routes[expressRoute]).forEach((method: string) => {
      const { operation, responses, produces }: Route<Request, Response> = this.routes[
        expressRoute
      ][method];
      const openAPIV3Def = operation.schema as OpenAPIV3Document;
      const openAPIV2Def = operation.schema as OpenAPIV2Document;
      const basePath: string | undefined =
        openAPIV3Def.servers && openAPIV3Def.servers[0].url
          ? openAPIV3Def.servers[0].url
          : openAPIV2Def.basePath;
      // @ts-ignore
      this.app[method](basePath + expressRoute, (req: Request, res: Response, next: ICallback) => {
        const startTime = new Date();
        const resolverWraper = (response: any) => {
          if (res.headersSent || res.finished) {
            return null;
          }

          if (!res.statusCode) {
            res.status(200);
          }

          if (responses[res.statusCode]) {
            const openAPIV3 = operation.schema as OpenAPIV3Document;
            const contentType = openAPIV3.openapi
              ? Object.keys(responses[res.statusCode].content)[0]
              : produces[0];
            res.set({
              'Content-type': contentType,
              ...responses[res.statusCode].headers
            });
          }

          res.json(response || {});
          const finalTime = new Date().getTime() - startTime.getTime();

          this.logger.info(
            `The operation execution of ${basePath}${expressRoute} took: ${
              typeof finalTime === 'number' ? finalTime.toFixed(2) : 'unkown'
            } ms`
          );
          return res.end();
        };
        const rejectWraper = (response: any) => {
          res.status(response.statusCode || 500);
          const finalTime = new Date().getTime() - startTime.getTime();
          this.logger.info(
            `The operation execution of ${basePath}${expressRoute} took: ${
              typeof finalTime === 'number' ? finalTime.toFixed(2) : 'unkown'
            } ms`
          );

          return next(response);
        };

        operation
          .run({ req, res })
          .then(resolverWraper)
          .catch(rejectWraper);
      });

      this.logger.info(
        '[OK]',
        chalk.yellowBright(
          `[${method.toUpperCase()}] ${basePath + expressRoute} operation exposed on the API from ${
            operation.serviceId
          }.${operation.schema.info.version}.${operation.operationId}`
        )
      );
      this.logger.events.emit(EventTypes.EXPOSE_OPERATION, {
        operation,
        route: basePath + expressRoute
      });
    });
  }

  private updateRoutes() {
    Object.keys(this.services).forEach(serviceId => {
      const service = this.services[serviceId];
      Object.keys(service).forEach(versionId => {
        const version = service[versionId];
        const apiVersion = this.apiDefinitions.find(ad => ad.info.version === versionId);
        if (!apiVersion) {
          this.logger.warn(
            `[WARN] ${serviceId}.${apiVersion} version not found on the given api definitions`
          );
        } else {
          Object.keys(version).forEach((operationId: string) => {
            const operation = version[operationId];
            if (Object.keys(operation.schema.paths).length > 0 && !operation.private) {
              const { method, expressRoute, responses, produces } = getSchemaData(
                operation.schema.paths
              );
              if (!this.routes[expressRoute]) {
                this.routes[expressRoute] = {};
              }

              this.routes[expressRoute][method] = {
                operation,
                responses,
                produces
              };
            } else {
              this.logger.warn(
                `[WARN] ${operation.serviceId}.${
                  operation.operationId
                } operation definition not found`
              );
            }
          });
        }
      });
    });

    return this.routes;
  }

  /**
   *
   * Add the standard express middlewares and create the created services routes using the given OpenAPI definition.
   * @param {MiddlewareOptions} [options={
   *       cors: {
   *         enabled: true
   *       },
   *       bodyParser: {
   *         enabled: true
   *       },
   *       helmet: {
   *         enabled: true
   *       },
   *       morgan: {
   *         enabled: true
   *       },
   *       explorer: {
   *         enabled: true
   *       }
   *     }]
   * @returns
   * @memberof BautaJSExpress
   */
  public applyMiddlewares(
    options: MiddlewareOptions = {
      cors: {
        enabled: true
      },
      bodyParser: {
        enabled: true
      },
      helmet: {
        enabled: true
      },
      morgan: {
        enabled: true
      },
      explorer: {
        enabled: true
      }
    }
  ) {
    if (
      !options.morgan ||
      (options.morgan && options.morgan.enabled === true && !options.morgan.options)
    ) {
      this.app.use(
        morgan(logFormat, {
          immediate: true
        })
      );
      this.app.use(
        morgan('tiny', {
          immediate: false
        })
      );
    } else if (options.morgan && options.morgan.options) {
      this.app.use(morgan(options.morgan.options.format, options.morgan.options.options));
      this.app.use(
        morgan('tiny', {
          immediate: false
        })
      );
    }

    if (
      !options.helmet ||
      (options.helmet && options.helmet.enabled === true && !options.helmet.options)
    ) {
      this.app.use(helmet());
    } else if (options.helmet && options.helmet.options) {
      this.app.use(helmet(options.helmet.options));
    }

    if (!options.cors || (options.cors && options.cors.enabled === true && !options.cors.options)) {
      this.app.use(cors());
    } else if (options.cors && options.cors.options) {
      this.app.use(cors(options.cors.options));
    }
    this.app.use(compression());

    if (
      !options.bodyParser ||
      (options.bodyParser && options.bodyParser.enabled === true && !options.bodyParser.options)
    ) {
      this.app.use(bodyParser.json({ limit: '50mb' }));
      this.app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
    } else if (options.bodyParser && options.bodyParser.options) {
      this.app.use(bodyParser.json(options.bodyParser.options.json));
      this.app.use(bodyParser.urlencoded(options.bodyParser.options.urlEncoded));
    }

    this.updateRoutes();

    Object.keys(this.routes)
      .sort(routeOrder())
      .forEach(this.addRoute.bind(this));

    if (
      !options.explorer ||
      (options.explorer && options.explorer.enabled === true && !options.explorer.options)
    ) {
      this.apiDefinitions.forEach(apiDefinition =>
        this.app.use(
          `/${apiDefinition.info.version}/explorer`,
          swaggerUiExpress.serve,
          swaggerUiExpress.setup(apiDefinition)
        )
      );
    } else if (options.explorer && options.explorer.options) {
      this.apiDefinitions.forEach(apiDefinition =>
        this.app.use(
          `/${apiDefinition.info.version}/${(options.explorer as any).options.path}`,
          swaggerUiExpress.serve,
          swaggerUiExpress.setup(apiDefinition, ...(options.explorer as any).options)
        )
      );
    }

    return this;
  }

  /**
   * Start the express server as http/https listener
   * @param {number} [port=3000] - The port to listener
   * @param {string} [host='localhost'] - The api host
   * @param {boolean} [httpsEnabled=false] - True to start the server as https server
   * @param {Object} [httpsOptions] - True to start the server as https server
   * @param {string} [httpsOptions.cert] - The server cert
   * @param {string} [httpsOptions.key] - The server key
   * @param {string} [httpsOptions.passphrase] - The key's passphrase
   * @returns {http|https} - nodejs http/https server
   * @memberof BautaJSExpress#
   */
  listen(port = 3000, host = 'localhost', httpsEnabled = false, httpsOptions = {}) {
    let server;
    let protocol = 'http://';

    if (httpsEnabled) {
      protocol = 'https://';
      server = https.createServer(httpsOptions, this.app);
    } else {
      server = http.createServer(this.app);
    }

    server.listen(port, () => {
      const baseUrl = `${protocol + host}:${port}`;
      if (process.env.DEBUG) {
        this.logger.info(`Server listening on ${baseUrl}`);
      } else {
        // eslint-disable-next-line no-console
        console.info(`Server listening on ${baseUrl}`);
      }
    });

    return server;
  }
}

/**
 * A decorator to allow have intellisense on resolver files for non typescript projects
 * @export
 * @param {Resolver<Request, Response>} fn
 * @returns
 */
export function resolver(fn: Resolver<Request, Response>) {
  return fn;
}

/**
 * A decorator to allow intellisense on pushed steps on non typescript files
 * @export
 * @template TIn
 * @template TOut
 * @param {StepFn<TReq, TRes, TIn, TOut>} fn
 * @returns
 */
export function step<TIn, TOut>(fn: StepFn<Request, Response, TIn, TOut>) {
  return fn;
}

/**
 * A decorator to allow intellisense on pipeline on non typescript files
 * @export
 * @template TIn
 * @param {Pipeline<Request, Response, TIn>} fn
 * @returns
 */
export function pipeline<TIn>(fn: (pipeline: Pipeline<Request, Response, TIn>) => void) {
  return fn;
}

export default BautaJSExpress;
