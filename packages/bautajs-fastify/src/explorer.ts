import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import swagger, { SwaggerOptions } from '@fastify/swagger';
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
  }
) {
  const { paths: unusedPath, ...openapi } = opts.apiDefinition;
  const tags = getTags(opts.operations);
  const availableTags = openapi.tags?.filter(t => tags.includes(t.name));
  const opiFixed = JSON.parse(JSON.stringify(openapi).replace(/#\/components\/schemas\//, '#'));
  const swaggerOptions: SwaggerOptions = {
    routePrefix: `/explorer`,
    exposeRoute: true,
    mode: 'dynamic'
  };
  if ((opts.apiDefinition as OpenAPIV3Document).openapi) {
    swaggerOptions.openapi = { ...opiFixed, tags: availableTags };
  } else {
    swaggerOptions.swagger = { ...opiFixed, tags: availableTags };
  }
  await fastify.register(swagger.default, {
    ...swaggerOptions
  });
}

export default fp(explorerPlugin, { name: 'explorer' });
