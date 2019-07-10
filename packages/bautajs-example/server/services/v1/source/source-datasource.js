const { restDataSource } = require('@bautajs/datasource-rest');

module.exports = restDataSource({
  services: {
    test: {
      options: {
        cache: new Map()
      },
      operations: [
        {
          id: 'operation1',
          options(_, ctx, $static) {
            return {
              reqId: ctx.req.query.a,
              method: 'GET',
              url: `https://jsonplaceholder.typicode.com/posts?limit=${ctx.req.query.limit}`,
              headers: {
                'custom-header': $static.someVar
              }
            };
          }
        }
      ]
    }
  }
});
