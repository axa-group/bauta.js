const { dataSource } = require('@bautajs/core');

module.exports = dataSource({
  services: {
    testService: {
      operations: [
        {
          id: 'operation1',
          options(_, ctx) {
            return {
              someVariableOption: ctx.req.variableOption,
              url: 'https://google.com/'
            };
          }
        }
      ]
    }
  }
});
