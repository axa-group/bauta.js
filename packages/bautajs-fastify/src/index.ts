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
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import responseXRequestId from 'fastify-x-request-id';
import * as bautaJS from '@axa-group/bautajs-core';
import path from 'path';
import explorerPlugin from './explorer';
import exposeRoutesPlugin from './expose-routes';
import { BautaJSFastifyPluginOptions } from './types';

function processOperations(operations: bautaJS.Operations) {
  return Object.keys(operations).reduce((routes: any, operationId) => {
    const operation = operations[operationId];
    if (!operation.isPrivate() && operation.route) {
      if (!routes[operation.route.url]) {
        // eslint-disable-next-line no-param-reassign
        routes[operation.route.url] = {};
      }
      // eslint-disable-next-line no-param-reassign
      routes[operation.route.url][operation.route.method] = operation;
    }

    return routes;
  }, {});
}
export async function bautajsFastify(
  fastify: FastifyInstance,
  opts: BautaJSFastifyPluginOptions
): Promise<void>;
export async function bautajsFastify(
  fastify: FastifyInstance,
  opts: BautaJSFastifyPluginOptions & bautaJS.BautaJSOptions
): Promise<void>;
export async function bautajsFastify(fastify: any, opts: any) {
  const bautajs = opts.bautajsInstance
    ? opts.bautajsInstance
    : new bautaJS.BautaJS({
        // Cast should be done because interface of fastify is wrong https://github.com/fastify/fastify/issues/1715
        logger: fastify.log as bautaJS.Logger,
        ...opts
      });

  if (opts.inheritOperationsFrom) {
    bautajs.inheritOperationsFrom(opts.inheritOperationsFrom);
  }

  await bautajs.bootstrap();

  // Add x-request-id on the response
  fastify.register(responseXRequestId, { prefix: opts.prefix });

  if (opts.apiDefinition && (!opts.explorer || opts.explorer.enabled)) {
    fastify.register(explorerPlugin, {
      apiDefinition: opts.apiDefinition,
      operations: bautajs.operations,
      prefix: opts.prefix
    });
  }

  if (opts.exposeOperations !== false) {
    const routes = processOperations(bautajs.operations);
    fastify.register(exposeRoutesPlugin, {
      apiHooks: opts.apiHooks,
      routes,
      strictResponseSerialization: opts.strictResponseSerialization,
      validator: bautajs.validator,
      prefix: path.join(opts.prefix || '', opts.apiBasePath || '/api'),
      onResponseValidationError: opts.onResponseValidationError
    });
  }

  // This will give access to some fastify features inside the pipelines
  bautajs.decorate('fastify', fastify);
}

export * from './types';
export * from './operators';
export default fp(bautajsFastify, {
  fastify: '3.x',
  name: 'bautajs'
});
