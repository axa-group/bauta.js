import * as bautaJS from '@axa-group/bautajs-core';
import {
  onRequestHookHandler,
  preParsingHookHandler,
  preParsingAsyncHookHandler,
  preHandlerHookHandler,
  preSerializationHookHandler,
  onSendHookHandler,
  onResponseHookHandler,
  onTimeoutHookHandler,
  onErrorHookHandler,
  preValidationHookHandler,
  FastifyRequest,
  FastifyReply
} from 'fastify';

export interface ApiHooks {
  onRequest?: onRequestHookHandler | onRequestHookHandler[];
  preParsing?: preParsingHookHandler | preParsingAsyncHookHandler[];
  preHandler?: preHandlerHookHandler | preHandlerHookHandler[];
  preValidation?: preValidationHookHandler | preValidationHookHandler[];
  preSerialization?: preSerializationHookHandler<unknown> | preSerializationHookHandler<unknown>[];
  onSend?: onSendHookHandler<unknown> | onSendHookHandler<unknown>[];
  onResponse?: onResponseHookHandler | onResponseHookHandler[];
  onTimeout?: onTimeoutHookHandler | onTimeoutHookHandler[];
  onError?: onErrorHookHandler | onErrorHookHandler[];
}

export type OnResponseValidationError = (
  error: bautaJS.ValidationError,
  req: FastifyRequest,
  res: FastifyReply
) => any;

export interface BautaJSFastifyPluginOptions {
  /**
   * Custom BautaJS instance
   */
  bautajsInstance?: bautaJS.BautaJSInstance;
  inheritOperationsFrom?: bautaJS.BautaJSInstance;
  /**
   * In case an openAPI schema or an schema is provided to the routes, enable this flag will use it to serialize and validate the response.
   * - If this is enabled and response is not complaint with the schema, an error will be returned. Enable it will "IMPROVE THE PERFORMANCE".
   * - If this is disabled responses will be serialized with a normal stringify method.
   * @default false
   * @type {boolean}
   * @memberof BautaJSFastifyPluginOptions
   */
  enableResponseValidation?: boolean;
  /**
   * Automatically expose the bautajs operations as an endpoint.
   * @default true
   * @type {boolean}
   * @memberof BautaJSFastifyPluginOptions
   */
  exposeOperations?: boolean;
  explorer?: {
    enabled: boolean;
  };
  /**
   * Referees to the API base path
   * @default "/api/"
   * @type string
   * @memberof BautaJSFastifyPluginOptions
   */
  apiBasePath?: string;
  /**
   * Referees to the server prefix
   * @type string
   * @memberof BautaJSFastifyPluginOptions
   */
  prefix?: string;
  /**
   * If set to true, responses schemas will be add it to fastify instance making the response serialization strict by cutting out
   * all properties not present on the schema. See more info on https://github.com/fastify/fastify/blob/main/docs/Validation-and-Serialization.md#serialization
   *
   * @type {boolean}
   * @default true
   * @memberof BautaJSFastifyPluginOptions
   */
  strictResponseSerialization?: boolean;
  /**
   * Include global hooks for the api. This hooks will only be applied for the routes under `$prefix/$apiBasePath`
   *
   * @type {ApiHooks}
   * @memberof BautaJSFastifyPluginOptions
   */
  apiHooks?: ApiHooks;
  /**
   * Method executed after a response validation throws an error.
   * Since this happens after the error handler is executed you might need to reformat the validation errors.
   * Useful to format the errors to the desired error response format.
   *
   * @template ErrorFormat
   * @param {bautaJS.ValidationError} error
   * @param {ExpressRequest} req
   * @param {Response} res
   * @returns {ErrorFormat}
   * @memberof BautaJSExpressOptions
   */
  onResponseValidationError?: OnResponseValidationError;
}
