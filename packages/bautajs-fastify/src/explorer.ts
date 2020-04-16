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
import oas, { FastifyOASOptions } from 'fastify-oas';
import { FastifyInstance } from 'fastify';
import { Operations, Document, OpenAPIV3Document, OpenAPIV2Document } from '@bautajs/core';

function buildOpenAPIPaths(apiDefinition: Document, operations: Operations) {
  const paths: any = {};

  Object.keys(operations[apiDefinition.info.version]).forEach((key: string) => {
    const operation = operations[apiDefinition.info.version][key];
    if (operation.route) {
      if (!paths[operation.route.path]) {
        paths[operation.route?.path] = {};
      }
      paths[operation.route?.path][operation.route?.method.toLowerCase()] =
        operation.route?.openapiSource;
    }
  });

  return paths;
}

async function explorerPlugin(
  fastify: FastifyInstance,
  opts: { apiDefinitions: Document[]; operations: Operations },
  oasOptions: FastifyOASOptions
) {
  opts.apiDefinitions.forEach(apiDefinition => {
    const openAPIPath = `/${apiDefinition.info.version}/openapi.json`;
    const paths = buildOpenAPIPaths(apiDefinition, opts.operations);
    fastify.get(openAPIPath, (_, reply) => {
      reply.send({
        ...apiDefinition,
        paths,
        components: { ...(apiDefinition as OpenAPIV3Document).components, schemas: {} },
        definitions: {}
      });
    });
    const openapiVersion =
      (apiDefinition as OpenAPIV3Document).openapi || (apiDefinition as OpenAPIV2Document).swagger;
    const { paths: unusedPath, ...swagger } = apiDefinition;
    fastify.register(oas, {
      routePrefix: `/${apiDefinition.info.version}/explorer`,
      swagger,
      openapi: openapiVersion,
      exposeRoute: true,
      ...oasOptions
    });
  });
}

export default fp(explorerPlugin);
