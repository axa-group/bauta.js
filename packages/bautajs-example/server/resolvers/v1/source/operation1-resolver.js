const { resolver, pipeline } = require('@bautajs/express');
const { provider1 } = require('./source-datasource');

const myPipeline = pipeline(p =>
  p.push(response => {
    return response;
  })
);

module.exports = resolver(operations => {
  operations.v1.operation1
    .validateRequests(false)
    .validateResponses(false)
    .setup(p =>
      p
        .push(provider1())
        .push((response, ctx) => {
          ctx.token.onCancel(() => {
            console.log('O no was canceled');
          });

          return response;
        })
        .push((response, ctx) => {
          ctx.token.onCancel(() => {
            console.log('O no was canceled 2');
          });
          if (ctx.token.isCanceled) {
            return null;
          }
          return ctx.req.query.title
            ? response.filter(r => r.title.includes(ctx.req.query.title))
            : response;
        })
        .pushPipeline(myPipeline)
    );
});
