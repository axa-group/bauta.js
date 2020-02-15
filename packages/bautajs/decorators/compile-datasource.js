/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Licensed under the AXA Group Operations Spain S.A. License (the "License");
 * you may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Step = require('../core/Step');

/**
 * Compile the ctx data source with the given request, resolving all the data source variables
 * In your function you can access to the compiled data source throught ctx.dataSource and do a request using
 * ctx.dataSource.request();
 * In the datasources all the ctx variables (ctx.req...) and ctx.previousValue will be available.
 * @function compileDataSource
 * @async
 * @param {function} fn - the function to execute after compile the data source
 * @example
 * const compileDataSource = require('batuajs/decorators/compile-datasource');
 *
 * services.v1.test.op1.push(compileDataSource((_, ctx) => {
 *   return ctx.dataSource.request();
 * }))
 */
module.exports = fn => async (value, ctx) => {
  const step = new Step(fn);
  return step.run({ ...ctx, dataSource: ctx.dataSource({ ...ctx, previousValue: value }) }, value);
};
