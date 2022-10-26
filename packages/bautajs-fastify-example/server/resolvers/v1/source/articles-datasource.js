const { getRequest } = require('@axa/bautajs-fastify');
const { restProvider } = require('@axa/bautajs-datasource-rest');

module.exports.getAllArticles = restProvider(async (client, _, ctx, bautajs) => {
  const req = getRequest(ctx);

  return client.get(`https://jsonplaceholder.typicode.com/posts`, {
    cache: new Map(),
    reqId: req.query.a,
    method: 'GET',
    headers: {
      'custom-header': bautajs.staticConfig.someVar,
      resolveBodyOnly: true
    }
  });
});
