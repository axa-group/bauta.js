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
import bodyParser from 'body-parser';
import { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import { Operation, GenericError } from '@bautajs/core';

export enum EventTypes {
  /**
   * An operation was exposed throught express framework.
   */
  EXPOSE_OPERATION = '5'
}

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
  options?: morgan.Options;
}

export interface BodyParserOptions {
  json?: bodyParser.OptionsJson;
  urlEncoded?: bodyParser.OptionsUrlencoded;
}

export interface MiddlewareOptions {
  cors?: MiddlewareOption<CorsOptions>;
  bodyParser?: MiddlewareOption<BodyParserOptions>;
  helmet?: MiddlewareOption<helmet.IHelmetConfiguration>;
  morgan?: MiddlewareOption<MorganOptions>;
  explorer?: MiddlewareOption<ExplorerOptions>;
  reqGenerator?: MiddlewareOption<null>;
}
