const { restProvider } = require('@axa/bautajs-datasource-rest');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
module.exports.getAllArticles = restProvider((client, _prev, _ctx, _bautajs) => {
  return client.get(`https://jsonplaceholder.typicode.com/posts`, {
    method: 'GET'
  });
});
