const { resolver, pipe, match } = require('@axa/bautajs-core');
const { provider1 } = require('./source-datasource');

const myPipelinetwo = pipe((response, ctx) => {
  ctx.log.info('pipeline 2');

  return response;
});

const myPipeline = pipe((response, ctx) => {
  ctx.log.info('pipeline 1');
  return response;
});

module.exports = resolver(operations => {
  operations.operation1.setup(
    pipe(
      provider1(),
      match(m =>
        m
          .on(prev => {
            return prev === null;
          }, myPipeline)
          .otherwise(myPipelinetwo)
      )
    )
  );
});
