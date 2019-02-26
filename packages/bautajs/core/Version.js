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
   * Push an step/function to the end of all version operations chain
   * @param {any} step - the step function, value or class
   * @returns {Version} an instance of the operation
   * @memberof Version#
   * @example
   * //common-resolver.js
   * const compileDataSource = require('bautajs/decorators/compile-data-source');
   *
   * module.exports = (services) => {
   *  // Step can be a function that returns a promise
   *  services.cats.v1.push((previousValue) => Promise.resolve('myValue'));
   *  // Step can be a function that returns a value
   *  services.cats.v1.push((previousValue, ctx) =>{
   *    const req = ctx.req;
   *    return 'value';
   *  });
   *  // Step can be a function that returns a callback
   *  services.cats.v1.push((previousValue , ctx, done) => done(null, 'myValue'));
   *  // Step can be a value
   *  services.cats.v1.push('value');
   *  // Step can have pseudo decorators
   *  services.cats.v1.push(compileDataSource((_ , ctx) => {
   *    return ctx.dataSource.request();
   *  });
   * }
   */
  push(step) {
    this.operationIds.forEach(operationId => {
      this[operationId].push(step);
    });

    return this;
  }
};
