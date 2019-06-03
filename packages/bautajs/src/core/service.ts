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
import deepmerge from 'deepmerge';
import { logger } from '../logger';
import { isMergeableObject } from '../utils/is-mergeable-datasource';
import { Document, EventTypes, Operation, Service, ServiceTemplate } from '../utils/types';
import { OperationBuilder } from './operation';

export class ServiceBuilder {
  static create<TReq, TRes>(
    serviceId: string,
    datasourceTemplate: ServiceTemplate,
    apiDefinitions: Document[] = []
  ): Service<TReq, TRes> {
    const service: Service<TReq, TRes> = {};
    // Define the operations
    const { operations, options }: ServiceTemplate = datasourceTemplate || {
      operations: []
    };
    // Create API versions
    apiDefinitions.forEach(API => {
      service[API.info.version] = {};
    });

    operations.forEach(operationTemplate => {
      if (!operationTemplate.id) {
        throw new Error(`Operation id is a mandatory parameter on ${serviceId}`);
      }
      let previousOperation: Operation<TReq, TRes> | null;
      apiDefinitions.forEach(apiDefinition => {
        if (
          !operationTemplate.version ||
          (operationTemplate.version && operationTemplate.version === apiDefinition.info.version)
        ) {
          const operation = OperationBuilder.create<TReq, TRes>(
            operationTemplate.id,
            {
              ...operationTemplate,
              options: deepmerge(options || {}, operationTemplate.options || {}, {
                isMergeableObject
              })
            },
            apiDefinition,
            serviceId
          );

          // Add inerithance method to the current operation
          if (previousOperation && operationTemplate.inherit !== false) {
            previousOperation.nextVersionOperation = operation;
          }

          service[apiDefinition.info.version][operationTemplate.id] = operation;
          previousOperation = operation;
        }
      });

      logger.info(`[OK] ${serviceId}.${operationTemplate.id} operation registered on bautajs`);
      logger.events.emit(EventTypes.REGISTER_SERVICE, {
        service: serviceId,
        operation: operationTemplate
      });
    });

    return service;
  }
}

export default ServiceBuilder;
