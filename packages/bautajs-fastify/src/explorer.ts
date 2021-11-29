import fp from 'fastify-plugin';
import fOpenAPIDocs from 'fastify-openapi-docs';
import { FastifyInstance } from 'fastify';
import { Operations, Document } from '@axa/bautajs-core';

function getTags(operations: Operations) {
  const tags: string[] = [];

  Object.keys(operations).forEach((key: string) => {
    const operation = operations[key];
    if (operation.route && operation.isSetup()) {
      if (operation.route?.openapiSource.tags) {
        tags.push(...operation.route.openapiSource.tags);
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
