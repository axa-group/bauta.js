const { resolver, pipelineBuilder, match } = require('@bautajs/core');
const {
  exampleRestDataSourceTemplate,
  exampleRestDataSource,
  exampleRestProviderTemplate,
  exampleRestProvider
} = require('./numbers-datasource');

const transformResponse = response => {
  const result = {
    message: response
  };

  return result;
};

module.exports = resolver(operations => {
  operations.v1.randomYear
    .validateRequest(false)
    .validateResponse(false)
    .setup(p =>
      p.pipe(
        exampleRestDataSourceTemplate.obtainRandomYearFact(),
        transformResponse
      )
    );
  operations.v1.randomYear2
    .validateRequest(false)
    .validateResponse(false)
    .setup(p =>
      p.pipe(
        exampleRestDataSource.obtainRandomYearFact(),
        transformResponse
      )
    );

  operations.v1.factNumber
    .validateRequest(false)
    .validateResponse(false)
    .setup(p =>
      p.pipe(
        exampleRestProviderTemplate(),
        transformResponse
      )
    );

  operations.v1.factNumber2
    .validateRequest(false)
    .validateResponse(false)
    .setup(p =>
      p.pipe(
        exampleRestProvider(),
        transformResponse
      )
    );
});
