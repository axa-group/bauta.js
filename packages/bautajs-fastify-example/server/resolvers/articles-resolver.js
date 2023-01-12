const { pipe, resolver } = require('@axa/bautajs-core');
const { getAllArticles } = require('../datasources/articles-datasource');

module.exports = resolver(operations => {
  operations.listAllArticles
    .validateRequest(false)
    .validateResponse(false)
    .setup(pipe(getAllArticles()));
});
