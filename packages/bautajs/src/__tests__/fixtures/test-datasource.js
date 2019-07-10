module.exports = {
  services: {
    testService: {
      operations: [
        {
          id: 'operation1',
          runner(_, ctx) {
            return {
              headers: {
                someVariableOption: ctx.req.variableOption
              },
              url: 'https://google.com/'
            };
          }
        }
      ]
    }
  }
};
