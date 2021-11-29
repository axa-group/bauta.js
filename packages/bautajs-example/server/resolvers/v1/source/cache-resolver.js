const { getRequest } = require('@axa/bautajs-express');
const { pipe, resolver, step } = require('@axa/bautajs-core');
const { cache } = require('@axa/bautajs-decorator-cache');
const { chuckProvider } = require('./chuck-datasource');

const transformResponse = step(response => {
  return {
    message: response
  };
});

const normalizer = (_, ctx) => {
  const req = getRequest(ctx);
  return req.params.string;
};

const chuckFactsPipeline = pipe(chuckProvider(), transformResponse);

const cachedChuckFactsPipeline = pipe(cache(chuckFactsPipeline, normalizer, { maxSize: 2 }));

module.exports = resolver(operations => {
  operations.chuckFacts.setup(cachedChuckFactsPipeline);
});
