const { restProvider } = require('@bautajs/datasource-rest');

module.exports.provider1 = restProvider((client, _, ctx, bautajs) => {
  return client.get(`https://jsonplaceholder.typicode.com/posts?limit=${ctx.req.query.limit}`, {
    cache: new Map(),
    reqId: ctx.req.query.a,
    method: 'GET',
    headers: {
      'custom-header': bautajs.staticConfig.someVar
    }
  });
});
