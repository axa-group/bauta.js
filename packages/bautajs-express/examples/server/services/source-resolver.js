const compileDataSource = require('bautajs/decorators/compile-datasource');

module.exports = services => {
  services.test.v1.operation1.push(
    compileDataSource((_, ctx) => {
      ctx.logger.info(ctx.dataSource);
      return [
        {
          id: '1',
          name: 'yiye',
          tag: 'maltes'
        }
      ];
    })
  );
};
