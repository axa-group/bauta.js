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
import bodyParser from 'body-parser';
import { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import { Operation } from '@bautajs/core';

export enum EventTypes {
  /**
   * An operation was exposed throught express framework.
   */
  EXPOSE_OPERATION = '5'
}

export interface ICallback {
  (error?: Error | null, result?: any): void;
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
}
