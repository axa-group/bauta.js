/*
 * Copyright (c) 2018 AXA Shared Services Spain S.A.
 *
 * Licensed under the MyAXA inner-source License (the "License");
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

function runInSerial(array) {
  return array.reduce((chain, next) => chain.then(value => next(value)), Promise.resolve());
}

/**
 * Execute the given steps in serial. It's another way to add the steps without have to do .push().push() ...
 * @function batch
 * @async
 * @param {...function} fn - the array functions/steps to execute
 * @example
 * const compileDataSource = require('batuajs/decorators/compile-datasource');
 * const batch = require('batuajs/decorators/batch');
 *
 * services.v1.test.op1.push(batch(compileDataSource((_, ctx) => {
 *   return ctx.dataSource.request();
 * })), (result) => {
 *   return {
 *     id: result.id
 *   }
 * });
 *
 * // add as an array
 * services.v1.test.op1.push(batch([
 *  compileDataSource((_, ctx) => {
 *    return ctx.dataSource.request();
 *  })),
 *  (result) => {
 *    return {
 *      id: result.id
 *    }
 *  }
 * ])
 */
module.exports = (...args) => async ctx =>
  runInSerial(args.map(step => value => new Step(step).run(ctx, value)));
