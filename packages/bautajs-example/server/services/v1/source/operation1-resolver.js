const { resolver } = require('@bautajs/express');
const { compileDataSource } = require('@bautajs/datasource-rest');

module.exports = resolver(services => {
  services.test.v1.operation1.setup(p =>
    p
      .push(compileDataSource((_, ctx) => ctx.dataSource.request()))
      .push(
        (response, ctx) =>
          ctx.req.query.title
            ? response.filter(r => r.title.includes(ctx.req.query.title))
            : response
      )
  );
});
