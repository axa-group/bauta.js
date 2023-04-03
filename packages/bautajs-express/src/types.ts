import { Options as ExpressPinoOptions } from 'express-pino-logger';
import * as express from 'express';
import bodyParser from 'body-parser';
import { CorsOptions } from 'cors';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import {
  Operation,
  GenericError,
  Logger,
  BautaJSOptions,
  ValidationError
} from '@axa/bautajs-core';

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
  opts?: false | SwaggerUiOptions | null;
  options?: SwaggerOptions;
  customCss?: SwaggerGenericOptions;
  customfavIcon?: SwaggerGenericOptions;
  swaggerUrl?: SwaggerGenericOptions;
  customeSiteTitle?: SwaggerGenericOptions;
  swaggerOptions?: SwaggerOptions;
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
  expressPino?: MiddlewareOption<ExpressPinoOptions>;
  explorer?: MiddlewareOption<ExplorerOptions>;
  reqGenerator?: MiddlewareOption<null>;
  routerOptions?: express.RouterOptions;
  apiBasePath?: string;
}

export type ExpressRequest = express.Request & { id: string; log: Logger };

export type OnResponseValidationError = (
  error: ValidationError,
  req: ExpressRequest,
  res: express.Response
) => any;

export interface BautaJSExpressOptions extends BautaJSOptions {
  logger?: Logger;
  /**
   * Method executed after a response validation throws an error.
   * Since this happens after the error handler is executed you might need to reformat the validation errors.
   * Useful to format the errors to the desired error response format.
   *
   * @template ErrorFormat
   * @param {ValidationError} error
   * @param {ExpressRequest} req
   * @param {Response} res
   * @returns {ErrorFormat}
   * @memberof BautaJSExpressOptions
   */
  onResponseValidationError?: OnResponseValidationError;
}
