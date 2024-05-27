import { pipe, step, resolver } from '@axa/bautajs-core';
import { getRequest } from '../../../src/index.js';

const transformResponse = step(response => {
  return {
    message: response
  };
});

function generalStep(_prev, ctx) {
  const req = getRequest(ctx);

  const { key } = req.params;

  return `This is the general text for requests and now we are receiving: ${key}`;
}

function specificStep() {
  return 'This is a simple text for requests to the specific path';
}

export default resolver(operations => {
  operations.multiplePathSpecific
    .validateRequest(false)
    .validateResponse(false)
    .setup(pipe(specificStep, transformResponse));

  operations.multiplePathGeneral
    .validateRequest(false)
    .validateResponse(false)
    .setup(pipe(generalStep, transformResponse));
});
