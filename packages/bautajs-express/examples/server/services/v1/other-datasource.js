const { dataSource } = require('@bautajs/core');

module.exports = dataSource({
  services: {
    test2: {
      options: {
        cache: new Map()
      },
      operations: [
        {
          especialCase: '{{#? ctx.req.notFound}}',
          especialCaseFound: '{{#? config.someVar}}',
          id: 'operation3',
          reqId: '{{ctx.req.query.a}}',
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/posts',
          options: {
            headers: {
              'custom-header': 2
            }
          }
        }
      ]
    }
  }
});
