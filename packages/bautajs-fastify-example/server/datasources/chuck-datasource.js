const { getRequest } = require('@axa/bautajs-fastify');
const { restProvider } = require('@axa/bautajs-datasource-rest');

// Used to test that an https works
const chuckProvider = restProvider((client, _, ctx) => {
  const req = getRequest(ctx);
  return client.get(`https://api.chucknorris.io/jokes/search?query=${req.params.string}`, {
    rejectUnauthorized: false
  });
});

module.exports = {
  chuckProvider
};
