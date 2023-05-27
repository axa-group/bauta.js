const { resolver, step, pipe } = require('@axa/bautajs-core');
const { exampleRestProviderYear, exampleRestProvider } = require('./numbers-datasource');

const transformResponse = step(response => {
  return {
    message: response
  };
});

module.exports = resolver(operations => {
  operations.randomYear.setup(pipe(exampleRestProviderYear(), transformResponse));
  operations.randomYear2.setup(pipe(exampleRestProviderYear(), transformResponse));

  operations.factNumber.setup(pipe(exampleRestProvider(), transformResponse));

  operations.factNumber2.setup(pipe(exampleRestProvider(), transformResponse));
});
