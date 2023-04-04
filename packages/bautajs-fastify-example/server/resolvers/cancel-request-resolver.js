const { resolver, pipe, step } = require('@axa/bautajs-core');
const { getRequest } = require('@axa/bautajs-fastify');

const transformResponse = step(response => {
  return {
    message: response
  };
});

function getNumberFromRequestStep(_prev, ctx) {
  const req = getRequest(ctx);

  const { number } = req.params;

  return number;
}

function giveAnswerAfterWaitingWithTimeout() {
  return step(async (number, ctx) => {
    const timeout = number * 1000;
    const promiseAnswer = new Promise(resolve =>
      setTimeout(() => {
        resolve(`We have waited for ${number} seconds`);
      }, timeout)
    );
    const cancelTimeout = 3000;
    const cancelator = new Promise(resolve =>
      setTimeout(() => {
        ctx.token.cancel(); // If this triggers the promise does not resolve but it is cancelled
        resolve('ended before the time!');
      }, cancelTimeout)
    );

    return Promise.race(await [promiseAnswer, cancelator]);
  });
}

module.exports = resolver(operations => {
  operations.cancelRequest
    .validateRequest(false)
    .validateResponse(false)
    .setup(pipe(getNumberFromRequestStep, giveAnswerAfterWaitingWithTimeout(), transformResponse));
});
