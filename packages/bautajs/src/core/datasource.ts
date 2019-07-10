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
import {
  BautaJSInstance,
  Context,
  OperationDataSourceBuilder,
  OperationTemplate
} from '../utils/types';

export function buildDataSource(
  operationTemplate: OperationTemplate<any, any>,
  bautajs: BautaJSInstance
): OperationDataSourceBuilder<any> {
  const datasourceAsFn = function dataSourceFn(this: Context, previousValue: any = null): any {
    return operationTemplate.runner(
      previousValue,
      this,
      process.env,
      operationTemplate.staticData,
      bautajs
    );
  };

  return Object.assign(datasourceAsFn, {
    template: operationTemplate
  }) as OperationDataSourceBuilder<any>;
}

export default buildDataSource;