const { getRequest } = require('@axa/bautajs-express');
const { pipe, resolver } = require('@axa/bautajs-core');
const { cache } = require('@axa/bautajs-decorator-cache');
const { chuckProvider } = require('../datasources/chuck-datasource');

const normalizer = (_, ctx) => {
  const req = getRequest(ctx);
  return req.params.string;
};

const chuckFactsPipeline = pipe(chuckProvider());

const cachedChuckFactsPipeline = pipe(cache(chuckFactsPipeline, { maxSize: 2 }, normalizer));

module.exports = resolver(operations => {
  operations.chuckFacts.setup(cachedChuckFactsPipeline);
});
