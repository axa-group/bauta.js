const { restProvider } = require('@axa/bautajs-datasource-rest');
const { getRequest } = require('../../../../../dist/index');

const exampleRestProviderYear = restProvider((client, _prv, ctx) => {
  return client.get('http://numbersapi.com/random/year?json', {
    headers: getRequest(ctx).headers
  });
});

const exampleRestProvider = restProvider((client, _prv, ctx) => {
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
