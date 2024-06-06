import { pipe, step, resolver } from '@axa/bautajs-core';
import { exampleRestProviderYear, exampleRestProvider } from '../datasources/numbers-datasource.js';

const transformResponse = step(response => {
  return {
    message: response
  };
});

export default resolver(operations => {
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
