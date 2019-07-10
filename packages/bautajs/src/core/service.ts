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
import { logger } from '../logger';
import {
  BautaJSInstance,
  Document,
  EventTypes,
  Operation,
  Service,
  ServiceTemplate
} from '../utils/types';
import { OperationBuilder } from './operation';

export class ServiceBuilder {
  static create(
    serviceId: string,
    datasourceTemplate: ServiceTemplate<any>,
    apiDefinitions: Document[] = [],
    dataSourceStatic: any,
    batuajs: BautaJSInstance
  ): Service {
    const service: Service = {};
    // Define the operations
    const { operations }: ServiceTemplate<any> = datasourceTemplate || {
      operations: []
    };
    // Create API versions
    apiDefinitions.forEach(API => {
      service[API.info.version] = {};
    });
    operations.forEach(op => {
      if (!op.id) {
        throw new Error(`Operation id is a mandatory parameter on ${serviceId}`);
      }

      let previousOperation: Operation | null;
      apiDefinitions.forEach(apiDefinition => {
        if (!op.version || (op.version && op.version === apiDefinition.info.version)) {
          const operation = OperationBuilder.create(
            op.id,
            {
              ...op,
              staticData: dataSourceStatic
            },
            apiDefinition,
            serviceId,
            batuajs
          );

          // Add inerithance method to the current operation
          if (previousOperation && op.inherit !== false) {
            previousOperation.nextVersionOperation = operation;
          }

          service[apiDefinition.info.version][op.id] = operation;
          previousOperation = operation;
        }
      });

      logger.info(`[OK] ${serviceId}.${op.id} operation registered on bautajs`);
      logger.events.emit(EventTypes.REGISTER_SERVICE, {
        service: serviceId,
        operation: op
      });
    });

    return service;
  }
}

export default ServiceBuilder;
