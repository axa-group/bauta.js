// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { getRequest } = require('@axa/bautajs-fastify');
const { restProvider } = require('@axa/bautajs-datasource-rest');

const exampleRestProviderYear = restProvider(async (client, _prv, ctx) => {
  const req = getRequest(ctx);
  const result = await client.get('http://numbersapi.com/random/year?json', {
    headers: req.headers,
    resolveBodyOnly: false
  });

  return result.body.text;
});

const exampleRestProvider = restProvider(async (client, _prv, ctx) => {
  const req = getRequest(ctx);

  return client.get(`http://numbersapi.com/${req.params.number}/math`, {
    responseType: 'text',
    resolveBodyOnly: true,
    headers: req.headers
  });
});

module.exports = {
  exampleRestProviderYear,
  exampleRestProvider
};
