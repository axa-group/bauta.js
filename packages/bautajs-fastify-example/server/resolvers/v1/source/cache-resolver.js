const { getRequest } = require('@axa/bautajs-fastify');
const { pipe, resolver, step } = require('@axa/bautajs-core');
const { cache } = require('@axa/bautajs-decorator-cache');
const { chuckProvider } = require('./chuck-datasource');

const transformResponse = step(response => {
  return {
    message: JSON.stringify(response)
  };
});

const normalizer = (_, ctx) => {
  const req = getRequest(ctx);
  return req.params.string;
};

const chuckFactsPipeline = pipe(chuckProvider(), transformResponse);

const cachedChuckFactsPipeline = pipe(cache(chuckFactsPipeline, { maxSize: 2 }, normalizer));

module.exports = resolver(operations => {
  operations.chuckFacts.setup(cachedChuckFactsPipeline);
});
