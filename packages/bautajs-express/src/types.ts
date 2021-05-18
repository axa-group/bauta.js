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
import * as express from 'express';
import bodyParser from 'body-parser';
import { CorsOptions } from 'cors';
import morgan from 'morgan';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import { Operation, GenericError, Logger } from '@bautajs/core';

export interface ICallback {
  (error?: GenericError, result?: any): void;
}

export type SwaggerGenericOptions = string | false | null;

export interface SwaggerUiOptions {
  [key: string]: any;
}

export interface SwaggerOptions {
  [key: string]: any;
}

export interface Route {
  operation: Operation;
  responses: OpenAPIV3.ResponsesObject | OpenAPIV2.ResponsesObject;
  produces: OpenAPIV2.MimeTypes;
  isSwagger: boolean;
}

export interface MiddlewareOption<T> {
  enabled: boolean;
  options?: T;
}

export interface ExplorerOptions {
  path?: string;
  opts?: false | SwaggerUiOptions | null | undefined;
  options?: SwaggerOptions | undefined;
  customCss?: SwaggerGenericOptions;
  customfavIcon?: SwaggerGenericOptions;
  swaggerUrl?: SwaggerGenericOptions;
  customeSiteTitle?: SwaggerGenericOptions;
  swaggerOptions?: SwaggerOptions;
}

export interface MorganOptions {
  format: morgan.FormatFn;
  options?: morgan.Options<any, any>;
}

export interface BodyParserOptions {
  json?: bodyParser.OptionsJson;
  urlEncoded?: bodyParser.OptionsUrlencoded;
}

export interface HelmetOptions {
  // See helment options at https://github.com/helmetjs/helmet
  [key: string]: any;
}

export interface RouterOptions {
  cors?: MiddlewareOption<CorsOptions>;
  bodyParser?: MiddlewareOption<BodyParserOptions>;
  helmet?: MiddlewareOption<HelmetOptions>;
  morgan?: MiddlewareOption<MorganOptions>;
  explorer?: MiddlewareOption<ExplorerOptions>;
  reqGenerator?: MiddlewareOption<null>;
  routerOptions?: express.RouterOptions;
  apiBasePath?: string;
}

export type ExpressRequest = express.Request & { id: string; log: Logger };
