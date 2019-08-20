const { resolver, pipeline, match } = require('@bautajs/core');
const { provider1 } = require('./source-datasource');

const myPipelinetwo = pipeline(p =>
  p.pipe(response => {
    console.log('pipeline 2');

    return response;
  })
);

const myPipeline = pipeline(p =>
  p.pipe(response => {
    console.log('pipeline 1');
    return response;
  })
);

module.exports = resolver(operations => {
  operations.v1.operation1
    .validateRequests(false)
    .validateResponses(false)
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
