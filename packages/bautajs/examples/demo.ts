/*
 * Copyright (c) AXA Shared Services Spain S.A.
 *
 * Licensed under the AXA Shared Services Spain S.A. License (the 'License'); you
 * may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import path from 'path';
import { BautaJS } from '../src/index';

interface Req {
  headers: any;
  query: any;
}

interface Res {
  body: any;
  statusCode: number;
}
const bautajs = new BautaJS<Req, Res>(
  [{ openapi: '3.0', paths: {}, info: { title: 'hola', version: '1' } }],
  {
    dataSourcesPath: path.resolve(__dirname, './datasource.json')
  }
);

bautajs.services.policies.v1.find.setup(pipeline =>
  pipeline.push(() => 6).push((_, ctx) => {
    return ctx.dataSource().request({ resolveBodyOnly: true });
  })
);
