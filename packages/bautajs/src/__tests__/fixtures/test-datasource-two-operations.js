module.exports = {
  services: {
    testService: {
      operations: [
        {
          id: 'operation1',
          runner(_, ctx) {
            return {
              someVariableOption: ctx.req.variableOption,
              url: 'https://google.com/'
            };
          }
        },
        {
          id: 'operation2',
          runner(_, ctx) {
            return {
              someVariableOption: ctx.req.variableOption,
              url: 'https://google.com/'
            };
          }
        }
      ]
    }
  }
};
