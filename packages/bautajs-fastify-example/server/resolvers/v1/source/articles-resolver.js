const { pipe, match, resolver } = require('@axa/bautajs-core');
const { getAllArticles } = require('./articles-datasource');

const myPipelineTwo = pipe((response, ctx) => {
  ctx.log.info('pipeline 2');

  return response;
});

const myPipeline = pipe((response, ctx) => {
  ctx.log.info('pipeline 1');
  return response;
});

module.exports = resolver(operations => {
  operations.getAllArticles
    .validateRequest(false)
    .validateResponse(false)
    .setup(
      pipe(
        getAllArticles(),
        match(m =>
          m
            .on(prev => {
              return prev === null;
            }, myPipeline)
            .otherwise(myPipelineTwo)
        )
      )
    );
});
