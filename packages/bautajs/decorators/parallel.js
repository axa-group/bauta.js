/*
 * Copyright (c) AXA Shared Services Spain S.A.
 *
 * Licensed under the AXA Shared Services Spain S.A. License (the "License"); you
 * may not use this file except in compliance with the License.
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

function runInParallel(array) {
  return Promise.all(array);
}

/**
 * Execute the given steps in parallel.
 * @function parallel
 * @async
 * @param {...function} fn - the array functions/steps to execute
 * @example
 * const compileDataSource = require('batuajs/decorators/compile-datasource');
 * const parallel = require('batuajs/decorators/parallel');
 *
 * services.v1.test.op1.push(
 *  parallel(
 *    compileDataSource((_, ctx) => {
 *      return ctx.dataSource.request();
 *    })),
 *    compileDataSource((_, ctx) => {
 *      return ctx.dataSource.request({id: 1});
 *    })
 *  )
 * );
 *
 * // add as an array
 * services.v1.test.op1.push(parallel([
 *  compileDataSource((_, ctx) => {
 *    return ctx.dataSource.request();
 *  })),
 *  compileDataSource((_, ctx) => {
 *    return ctx.dataSource.request({id: 1});
 *  }))
 * ])
 */
module.exports = (fn, ...args) => async (firstValue, ctx) => {
  let fns;
  if (args.length > 0) {
    fns = [fn, ...args];
  } else {
    fns = fn;
  }

  return runInParallel(fns.map(step => new Step(step).run(ctx, firstValue)));
};
