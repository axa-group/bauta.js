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
import * as bautaJS from '@axa/bautajs-core';
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
export async function bautajsFastify(fastify: FastifyInstance, opts: any) {
  const bautajs = opts.bautajsInstance
    ? opts.bautajsInstance
    : new bautaJS.BautaJS({ logger: fastify.log as bautaJS.Logger, ...opts });

  if (opts.inheritOperationsFrom) {
    bautajs.inheritOperationsFrom(opts.inheritOperationsFrom);
  }

  await bautajs.bootstrap();

  // Add x-request-id on the response
  await fastify.register(responseXRequestId, { prefix: opts.prefix });

  const apiDefinition = opts.apiDefinition ?? opts.bautajsInstance.apiDefinition;

  await fastify
    .register(
      async function registerEndpoints(fastifySwagger) {
        // Scope of api prefix
        if (apiDefinition && (!opts.explorer || opts.explorer.enabled)) {
          fastifySwagger.register(explorerPlugin, {
            apiDefinition,
            operations: bautajs.operations
          });
        }
        if (opts.exposeOperations !== false) {
          const routes = processOperations(bautajs.operations);
          await fastifySwagger.register(exposeRoutesPlugin, {
            apiHooks: opts.apiHooks,
            routes,
            strictResponseSerialization: opts.strictResponseSerialization,
            validator: bautajs.validator,
            apiBasePath: opts.apiBasePath || '/api',
            onResponseValidationError: opts.onResponseValidationError
          });
        }
      },
      {
        prefix: opts.prefix
      }
    )
    .after(() => {
      fastify.log.info(`Explorer plugin registered at ${opts.prefix}explorer`);
    });

  // This will give access to some fastify features inside the pipelines
  bautajs.decorate('fastify', fastify);
}

export * from './types';
export * from './operators';
export default fp(bautajsFastify, {
  fastify: '4.x',
  name: 'bautajs'
});
