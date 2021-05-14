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
import { BautaJSInstance, createContext, pipe } from '../../index';
import { parallel } from '../parallel';

describe('parallel decorator', () => {
  test('should execute the promises in parallel', async () => {
    const pipeline = pipe(
      parallel(
        () => Promise.resolve({ id: 3, name: 'pet3' }),
        () => Promise.resolve({ id: 1, name: 'pet' })
      )
    );

    expect(await pipeline({}, createContext({}), {} as BautaJSInstance)).toStrictEqual([
      { id: 3, name: 'pet3' },
      { id: 1, name: 'pet' }
    ]);
  });
});
