module.exports = {
  services: {
    test: {
      options: {
        cache: new Map()
      },
      operations: [
        {
          id: 'operation1',
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
};
