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
const Version = require('./Version');
const logger = require('../logger');
const { defaultLoader } = require('../utils');

function haveToInherit(operation) {
  const noInherit =
    operation.apiDefinition.noInheritance &&
    operation.apiDefinition.noInheritance[operation.serviceName];

  return !noInherit || !noInherit.includes(operation.dataSource.template.name);
}

/**
 * The Service is a set of {@link Version}
 * @public
 * @class Service
 * @typedef {Object} Service
 * @param {string} serviceName - the service name
 * @param {Object} datasourceTemplate - a dictionary of services with his operations @see {@link ../validators/datasource-schema.json}
 * @param {Object[]} apiDefinitions - Array of [OpenAPI](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#specification) definitions.
 * @param {Object} [optionals] - optional stuff
 */
module.exports = class Service {
  constructor(serviceName, datasourceTemplate, apiDefinitions = []) {
    // Define the operations
    const { operations } = datasourceTemplate || { operations: [] };

    // Create API versions
    apiDefinitions.forEach(API => {
      this[API.versionId] = new Version(API.versionId);
    });

    operations.forEach(operationTemplate => {
      let previousOperation;
      apiDefinitions.forEach(apiDefinition => {
        if (
          !operationTemplate.versionId ||
          (operationTemplate.versionId && operationTemplate.versionId === apiDefinition.versionId)
        ) {
          const operation = new Operation([defaultLoader], operationTemplate, apiDefinition, {
            serviceName
          });

          // Add inerithance method to the current operation
          if (previousOperation && haveToInherit(operation)) {
            previousOperation.nextVersionOperation = operation;
          }

          this[apiDefinition.versionId].addOperation(operationTemplate.name, operation);
          previousOperation = operation;
        }
      });

      logger.log.info(
        `[OK] ${serviceName}.${operationTemplate.name} operation registered on bautajs`
      );
    });

    // Blue neva freeeezz!
    Object.keys(this).forEach(apiVersion => {
      Object.freeze(this[apiVersion]);
    });
  }
};
