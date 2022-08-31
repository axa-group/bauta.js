import expressPino, { Options as ExpressPinoOptions } from 'express-pino-logger';
import swaggerUiExpress from 'swagger-ui-express';
import cors, { CorsOptions } from 'cors';
import { json, RequestHandler, Router, urlencoded } from 'express';
import helmet from 'helmet';
import { Document, Operations, Logger, PathsObject } from '@axa/bautajs-core';
import fastSafeStringify from 'fast-safe-stringify';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import type { Logger as PinoLogger } from 'pino';
import { MiddlewareOption, BodyParserOptions, ExplorerOptions, HelmetOptions } from './types';
import { genReqId } from './utils';
import { reqSerializer } from './serializers/req';
import { resSerializer } from './serializers/res';

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
        pathItem[operation.route.method.toLowerCase() as OpenAPIV2.HttpMethods] = operation.route
          .openapiSource as OpenAPIV2.OperationObject;
      }
    }
  });

  return { paths, tags };
}

export function initReqIdGenerator(
  router: Router,
  logger: Logger,
  opt?: MiddlewareOption<null>,
  expressPinoOpt?: MiddlewareOption<ExpressPinoOptions>
) {
  if (!opt || (opt && opt.enabled === true)) {
    router.use((req: any, _, next) => {
      const { headers } = req;
      req.id = genReqId(headers);
      // The request logger will be provided by express-pino if it's not disabled
      if (expressPinoOpt?.enabled === false) {
        req.log = logger.child({
          reqId: req.id
        });
      }
      next();
    });
  }
}

export function initExpressPino(
  router: Router,
  logger: PinoLogger,
  opt?: MiddlewareOption<ExpressPinoOptions>
) {
  // Align with Fastify logger.
  const reqStartMw: RequestHandler = (req, _res, next) => {
    req.log.info({
      msg: 'incoming request'
    });

    next();
  };
  if (!opt || (opt && opt.enabled === true && !opt.options)) {
    const pino = expressPino({
      logger,
      genReqId: (req: any) => req.id,
      serializers: {
        req: reqSerializer,
        res: resSerializer
      },
      reqCustomProps: req => ({
        reqId: req.id
      })
    });
    router.use(pino);
    router.use(reqStartMw);
  } else if (opt && opt.enabled === true && opt.options) {
    const pino = expressPino({
      logger,
      genReqId: (req: any) => req.id,
      serializers: {
        req: reqSerializer,
        res: resSerializer
      },
      reqCustomProps: req => ({
        reqId: req.id
      }),
      ...opt.options
    });
    router.use(pino);
    router.use(reqStartMw);
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

  const swaggerEnabled: boolean = !opt || opt.enabled === true;
  const opts: ExplorerOptions | undefined = opt?.options;
  const path: string = opts?.path || 'explorer';

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
