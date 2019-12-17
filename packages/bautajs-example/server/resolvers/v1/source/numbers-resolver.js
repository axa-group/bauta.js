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
    .validateRequests(false)
    .validateResponses(false)
    .setup(p =>
      p.pipe(
        exampleRestDataSourceTemplate.obtainRandomYearFact(),
        transformResponse
      )
    );
  operations.v1.randomYear2
    .validateRequests(false)
    .validateResponses(false)
    .setup(p =>
      p.pipe(
        exampleRestDataSource.obtainRandomYearFact(),
        transformResponse
      )
    );

  operations.v1.factNumber
    .validateRequests(false)
    .validateResponses(false)
    .setup(p =>
      p.pipe(
        exampleRestProviderTemplate(),
        transformResponse
      )
    );

  operations.v1.factNumber2
    .validateRequests(false)
    .validateResponses(false)
    .setup(p =>
      p.pipe(
        exampleRestProvider(),
        transformResponse
      )
    );
});
