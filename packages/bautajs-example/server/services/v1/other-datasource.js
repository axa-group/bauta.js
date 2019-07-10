const { restDataSource } = require('@bautajs/datasource-rest');

module.exports = restDataSource({
  services: {
    test: {
      operations: [
        {
          id: 'operation2',
          options(_, ctx) {
            return {
              url: `https://jsonplaceholder.typicode.com/posts?limit=${ctx.req.query.limit}`
            };
          }
        }
      ]
    }
  }
});
