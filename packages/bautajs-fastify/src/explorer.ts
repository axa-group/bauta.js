import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { Operations, Document, OpenAPIV3Document } from '@axa/bautajs-core';

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

  // Register swagger with mode: 'dynamic'
  if ((opts.apiDefinition as OpenAPIV3Document).openapi) {
    await fastify.register(swagger, {
      mode: 'dynamic',
      openapi: { ...opiFixed, tags: availableTags }
    });
  } else {
    await fastify.register(swagger, {
      mode: 'dynamic',
      swagger: { ...opiFixed, tags: availableTags }
    });
  }

  // Build indexPrefix from parent prefix to fix static asset paths
  // When registered under /api/, the routes are at /api/explorer, but HTML references /explorer/static
  // indexPrefix adds the parent prefix to static asset URLs in the HTML
  const indexPrefix = opts.prefix ? opts.prefix.replace(/\/$/, '') : '';

  // Register swagger-ui after swagger
  await fastify.register(swaggerUi, {
    routePrefix: `/explorer`,
    indexPrefix,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  });
}

export default fp(explorerPlugin, { name: 'explorer' });
