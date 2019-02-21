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
const Operation = require('./Operation');

/**
 * The Version is a set of {@link Operation}
 * @public
 * @class Version
 * @typedef {Object} Version
 * @param {string} versionId - the version name
 */
module.exports = class Version {
  constructor(versionId) {
    this.versionId = versionId;
    this.operationIds = [];
  }

  /**
   * Create a new operation for the given version service. It is recomended to declare operations from the datasource and not using this method!
   * @param {string} id The operation id
   * @param {Operation} operation The operation instance
   * @returns {Version} An instance of the version
   * @memberof Version#
   * @example
   * const { services, Operation } = require('bautajs');
   * const dataSourceTemplate = {
   *  id: 'find'
   * }
   * const apiDefinition = {
   *  versionId:"v1",
   *  openapi: "3.0",
   *  info: {
   *    title:"version 1",
   *    version: "1.0"
   *  }
   * }
   * const operation = new Operation('myaOperationId', [() => 'hellow world'], dataSourceTemplate, apiDefinition, serviceId: 'cats' )
   *
   * services.cats.v1.addOperation(dataSourceTemplate.name, operation);
   */
  addOperation(id, operation) {
    const forbiddenNames = ['addMiddleware', this.versionId, 'operationIds', 'addOperation'];

    if (forbiddenNames.includes(id)) {
      throw new Error(
        `Can not create an operation with the reserved names, 'addOperation', 'addMiddleware', ${
          this.versionId
        } and operationIds`
      );
    }

    if (!(operation instanceof Operation)) {
      throw new Error('The provided operation is not an instance of a bautajs Operation');
    }

    this[id] = operation;
    this.operationIds.push(id);

    return this;
  }

  /**
   * Set a middleware before all the operations of the given version service. You can add as many as you want. The step will be added as the first executable function.
   * `MW2(new) -> MW1 -> P1 -> P2-> Loader -> N1 -> N2`
   * `Carefully do not use arrow functions if you want to access to the middleware this context`
   * @param {any} middleware - A function to add to all the version operations chain. It's a function that receives
   * a previous middleware step result and returns a promise, a value or a callback
   * @returns {Version} An instance of the version
   * @memberof Version#
   * @example
   * const { services } = require('bautajs');
   *
   * // Middleware step can be a function that returns a promise
   * services.cats.v1.addMiddleware((previousValue) => Promise.resolve('myValue'));
   * // Middleware step can be a function that returns a value
   * services.cats.v1.addMiddleware((previousValue) => 'value');
   * // Middleware step can be a function that returns a callback
   * services.cats.v1.addMiddleware((previousValue, done) => done(null, 'myValue'));
   * // Middleware step can be a value
   * services.cats.v1.addMiddleware('value');
   * // Middlewares can be chained, keep the order of execution as the declaration order.
   * services.cats.v1.addMiddleware((previousValue, done) => {
   *  // previousValue = 'value1';
   *  return done(null, previousValue);
   * }).addMiddleware('value1')
   */
  addMiddleware(middleware) {
    this.operationIds.forEach(operationId => {
      this[operationId].addMiddleware(middleware);
    });

    return this;
  }
};
