module.exports = {
  services: {
    testService: {
      operations: [
        {
          id: 'test',
          runner(_, ctx) {
            return {
              someVariableOption: ctx.req.variableOption,
              url: 'https://google.com/'
            };
          }
        },
        {
          id: 'testV2',
          version: 'v2',
          runner(_, ctx) {
            return {
              someVariableOption: ctx.req.variableOption,
              url: 'https://facebook.com/'
            };
          }
        }
      ]
    }
  }
};
