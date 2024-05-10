import { getRequest } from '@axa/bautajs-fastify';
import { cache, pipe, resolver } from '@axa/bautajs-core';
import { chuckProvider } from '../datasources/chuck-datasource.js';

const normalizer = (_, ctx) => {
  const req = getRequest(ctx);
  return req.params.string;
};

const chuckFactsPipeline = pipe(chuckProvider());

const cachedChuckFactsPipeline = pipe(cache(chuckFactsPipeline, { maxSize: 2 }, normalizer));

export default resolver(operations => {
  operations.chuckFacts.setup(cachedChuckFactsPipeline);
});
