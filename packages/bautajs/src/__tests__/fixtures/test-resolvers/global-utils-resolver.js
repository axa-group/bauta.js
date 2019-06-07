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
const { resolver } = require('../../../../dist/decorators/resolver');

module.exports = resolver((services, utils) => {
  services.testService.v1.operation1.setup(p =>
    p
      .push(() => {
        return [
          {
            id: 132,
            name: 'pet1'
          }
        ];
      })
      .push(utils.operation2Wrap)
  );

  services.testService.v1.operation2.setup(p =>
    p.push(() => {
      return [
        {
          id: 424,
          name: 'pet5'
        }
      ];
    })
  );
});