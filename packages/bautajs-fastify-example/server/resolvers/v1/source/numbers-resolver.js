const { pipe, step, resolver } = require('@axa/bautajs-core');
const { exampleRestProviderYear, exampleRestProvider } = require('./numbers-datasource');
const { catsRestProviderWithHttps } = require('./cats-datasource');

const transformResponse = step(response => {
  return {
    message: response
  };
});

const transformCatsResponse = step(response => {
  return response.map(c => ({
    text: c.text
  }));
});

module.exports = resolver(operations => {
  operations.randomYear
    .validateRequest(false)
    .validateResponse(false)
    .setup(pipe(exampleRestProviderYear(), transformResponse));

  operations.randomYear2
    .validateRequest(false)
    .validateResponse(false)
    .setup(pipe(exampleRestProviderYear(), transformResponse));

  operations.factNumber
    .validateRequest(false)
    .validateResponse(false)
    .setup(pipe(exampleRestProvider(), transformResponse));

  operations.factNumber2
    .validateRequest(false)
    .validateResponse(false)
    .setup(pipe(exampleRestProvider(), transformResponse));

  operations.cats
    .validateRequest(false)
    .validateResponse(false)
    .setup(pipe(catsRestProviderWithHttps(), transformCatsResponse));
});
