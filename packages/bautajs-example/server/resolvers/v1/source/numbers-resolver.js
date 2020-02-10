const { resolver } = require('@bautajs/core');
const { exampleRestProviderYear, exampleRestProvider } = require('./numbers-datasource');
const { catsRestProviderWithHttps } = require('./cats-datasource');

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
    .setup(p => p.pipe(exampleRestProviderYear(), transformResponse));
  operations.v1.randomYear2
    .validateRequest(false)
    .validateResponse(false)
    .setup(p => p.pipe(exampleRestProviderYear(), transformResponse));

  operations.v1.factNumber
    .validateRequest(false)
    .validateResponse(false)
    .setup(p => p.pipe(exampleRestProvider(), transformResponse));

  operations.v1.factNumber2
    .validateRequest(false)
    .validateResponse(false)
    .setup(p => p.pipe(exampleRestProvider(), transformResponse));

  operations.v1.cats
    .validateRequest(false)
    .validateResponse(false)
    .setup(p => p.pipe(catsRestProviderWithHttps(), transformResponse));
});
