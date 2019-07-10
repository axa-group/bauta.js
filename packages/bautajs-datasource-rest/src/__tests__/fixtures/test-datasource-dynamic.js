const { restDataSource } = require('../../index');

module.exports = restDataSource({
  services: {
    testService: {
      operations: [
        {
          id: 'operation1',
          options(_, ctx) {
            return {
              someVariableOption: ctx.req.variableOption,
              url: `https://google.com/${ctx.data.path}`
            };
          }
        }
      ]
    }
  }
});
