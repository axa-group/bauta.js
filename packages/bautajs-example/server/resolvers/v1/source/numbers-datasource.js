const { restProvider } = require('@bautajs/datasource-rest');

const exampleRestProviderYear = restProvider((client, _prv, ctx) => {
  return client.get('http://numbersapi.com/random/year?json', {
    headers: ctx.req.headers
  });
});

const exampleRestProvider = restProvider((client, _prv, ctx) => {
  return client.get(`http://numbersapi.com/${ctx.req.params.number}/math`, {
    responseType: 'text',
    resolveBodyOnly: true,
    headers: ctx.req.headers
  });
});

module.exports = {
  exampleRestProviderYear,
  exampleRestProvider
};
