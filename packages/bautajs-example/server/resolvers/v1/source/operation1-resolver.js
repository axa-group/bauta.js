const { resolver, pipelineBuilder, match } = require('@bautajs/core');
const { provider1 } = require('./source-datasource');

const myPipelinetwo = pipelineBuilder(p =>
  p.pipe(response => {
    console.log('pipeline 2');

    return response;
  })
);

const myPipeline = pipelineBuilder(p =>
  p.pipe(response => {
    console.log('pipeline 1');
    return response;
  })
);

module.exports = resolver(operations => {
  operations.v1.operation1
    .validateRequest(false)
    .validateResponse(false)
    .setup(p =>
      p.pipe(
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
