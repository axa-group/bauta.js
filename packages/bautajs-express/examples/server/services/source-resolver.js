const request = require('bautajs/decorators/request');

module.exports = services => {
  services.test.v1.operation1
    .push(request())
    .push((response, ctx) =>
      ctx.req.query.title ? response.filter(r => r.title.includes(ctx.req.query.title)) : response
    );
};
