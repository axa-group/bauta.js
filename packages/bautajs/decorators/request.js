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

/**
 * Compile the data source and do a request to the operation service
 * In the datasources all the ctx variables (ctx.req...) and ctx.previousValue will be available.
 * @function request
 * @async
 * @param {Object} options - the got request options
 * @example
 * const request = require('batuajs/decorators/request');
 *
 * services.v1.test.op1.push(request())
 */
module.exports = options => async (value, ctx) =>
  ctx.dataSource({ ...ctx, previousValue: value }).request(options);
