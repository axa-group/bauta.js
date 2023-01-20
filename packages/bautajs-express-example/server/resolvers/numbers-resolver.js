const { pipe, step, resolver } = require('@axa/bautajs-core');
const {
  exampleRestProviderYear,
  exampleRestProvider
} = require('../datasources/numbers-datasource');

const transformResponse = step(response => {
  return {
    message: response
  };
});

module.exports = resolver(operations => {
  operations.randomYear
    .validateRequest(false)
    .validateResponse(false)
    .setup(exampleRestProviderYear());

  operations.randomYear2
    .validateRequest(false)
    .validateResponse(false)
    .setup(pipe(exampleRestProviderYear(), transformResponse));

  operations.factNumber.validateRequest(false).validateResponse(false).setup(exampleRestProvider());

  operations.factNumber2
    .validateRequest(false)
    .validateResponse(false)
    .setup(pipe(exampleRestProvider(), transformResponse));
});
