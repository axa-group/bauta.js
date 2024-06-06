import Fastify from 'fastify';

import { bautajsFastify } from '@axa/bautajs-fastify';
import { BautaJS } from '@axa/bautajs-core';

import apiDefinitionsV1 from './api-definitions-v1.json' assert { type: 'json' };

import apiDefinitionsV2 from './api-definitions-v2.json' assert { type: 'json' };

const fastify = Fastify({ logger: true });

const bautaJsV1 = new BautaJS({
  apiDefinition: apiDefinitionsV1,
  resolversPath: './server/v1/resolvers*.js',
  staticConfig: {
    someVar: 2
  },
  strictResponseSerialization: false,
  validatorOptions: {
    coerceTypes: 'array'
  }
});

const bautaJsV2 = new BautaJS({
  apiDefinition: apiDefinitionsV2,
  resolversPath: './server/v2/resolvers*.js',
  staticConfig: {
    someVar: 2
  },
  strictResponseSerialization: false,
  validatorOptions: {
    coerceTypes: 'array'
  }
});

(async () => {
  fastify
    .register(bautajsFastify, {
      bautajsInstance: bautaJsV1,
      prefix: '/v1/',
      apiBasePath: '/api/'
    })
    .after(() => {
      fastify.register(bautajsFastify, {
        prefix: '/v2/',
        apiBasePath: '/api/',
        inheritOperationsFrom: bautaJsV1,
        bautajsInstance: bautaJsV2
      });
    });

  fastify.listen(
    {
      host: '0.0.0.0',
      port: 8282
    },
    err => {
      if (err) throw err;
      fastify.log.info('Server listening on localhost:', fastify.server.address().port);
    }
  );
})();
