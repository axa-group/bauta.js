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
import swaggerUiExpress from 'swagger-ui-express';
import morgan from 'morgan';
import cors, { CorsOptions } from 'cors';
import { Application } from 'express';
import helmet from 'helmet';
import { Document } from '@bautajs/core';
import { MiddlewareOption, MorganOptions, BodyParserOptions, ExplorerOptions } from './types';

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
  } else if (opt && opt.options) {
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
  } else if (opt && opt.options) {
    app.use(helmet(opt.options));
  }
}

export function initCors(app: Application, opt?: MiddlewareOption<CorsOptions>) {
  if (!opt || (opt && opt.enabled === true && !opt.options)) {
    app.use(cors());
  } else if (opt && opt.options) {
    app.use(cors(opt.options));
  }
}

export function initBodyParser(app: Application, opt?: MiddlewareOption<BodyParserOptions>) {
  if (!opt || (opt && opt.enabled === true && !opt.options)) {
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
  } else if (opt && opt.options) {
    app.use(bodyParser.json(opt.options.json));
    app.use(bodyParser.urlencoded(opt.options.urlEncoded));
  }
}

export function initExplorer(
  app: Application,
  apiDefinitions: Document[],
  opt?: MiddlewareOption<ExplorerOptions>
) {
  swaggerUiExpress.setup();

  if (!opt || (opt && opt.enabled === true && !opt.options)) {
    apiDefinitions.forEach(apiDefinition => {
      const openAPIPath = `/${apiDefinition.info.version}/openapi.json`;
      app.get(openAPIPath, (_, res) => {
        res.json(apiDefinition);
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
  } else if (opt && opt.options) {
    const opts: ExplorerOptions = opt.options;
    apiDefinitions.forEach(apiDefinition => {
      const openAPIPath = `/${apiDefinition.info.version}/openapi.json`;
      app.get(openAPIPath, (_, res) => {
        res.json(apiDefinition);
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
