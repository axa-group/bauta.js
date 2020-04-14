/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Licensed under the AXA Group Operations Spain S.A. License (the "License");
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
import { restDataSource } from '../../index';

export default restDataSource({
  providers: [
    {
      id: 'operation1',
      options(_, ctx) {
        return {
          someVariableOption: ctx.req.variableOption,
          url: `https://google.com/${ctx.data.path}`
        };
      }
    }
  ]
});