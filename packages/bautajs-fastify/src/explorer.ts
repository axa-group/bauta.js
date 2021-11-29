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
import fOpenAPIDocs from 'fastify-openapi-docs';
import { FastifyInstance } from 'fastify';
import { Operations, Document } from '@axa-group/bautajs-core';

function getTags(operations: Operations) {
  const tags: string[] = [];

  Object.keys(operations).forEach((key: string) => {
    const operation = operations[key];
    if (operation.route && operation.isSetup()) {
      if (operation.route?.openapiSource.tags) {
        tags.push(...operation.route?.openapiSource.tags);
      }
    }
  });

  return tags;
}

async function explorerPlugin(
  fastify: FastifyInstance,
  opts: {
    apiDefinition: Document;
    operations: Operations;
    prefix?: string;
  }
) {
  const { paths: unusedPath, ...openapi } = opts.apiDefinition;
  const tags = getTags(opts.operations);
  const availableTags = openapi.tags?.filter(t => tags.includes(t.name));
  const opiFixed = JSON.parse(JSON.stringify(openapi).replace(/#\/components\/schemas\//, '#'));
  fastify.register(fOpenAPIDocs, {
    prefix: opts.prefix?.replace(/\/$/, ''),
    openapi: { ...opiFixed, tags: availableTags }
  });
}

export default fp(explorerPlugin, { name: 'explorer' });
