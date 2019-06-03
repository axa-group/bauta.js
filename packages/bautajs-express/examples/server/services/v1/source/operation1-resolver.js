const { resolver } = require('../../../../../dist/index');

module.exports = resolver(services => {
  services.test.v1.operation1.setup(p =>
    p
      .push((value, ctx) => ctx.dataSource(value).request())
      .push(
        (response, ctx) =>
          ctx.req.query.title
            ? response.filter(r => r.title.includes(ctx.req.query.title))
            : response
      )
  );
});
