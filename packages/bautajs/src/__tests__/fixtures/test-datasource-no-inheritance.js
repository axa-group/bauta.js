module.exports = {
  services: {
    testService: {
      operations: [
        {
          id: 'operation1',
          inherit: false,
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
