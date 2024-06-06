import { pipe, resolver } from '@axa/bautajs-core';
import { getAllArticles } from '../datasources/articles-datasource.js';

export default resolver(operations => {
  operations.listAllArticles
    .validateRequest(false)
    .validateResponse(false)
    .setup(pipe(getAllArticles()));
});
