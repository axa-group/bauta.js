const { pipe, step, resolver } = require('@axa/bautajs-core');
const { getRequest } = require('../../../index');

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

module.exports = resolver(operations => {
  operations.multiplePathSpecific
    .validateRequest(false)
    .validateResponse(false)
    .setup(pipe(specificStep, transformResponse));

  operations.multiplePathGeneral
    .validateRequest(false)
    .validateResponse(false)
    .setup(pipe(generalStep, transformResponse));
});
