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
import { parallelAllSettled } from '../parallel-all-settled';

describe('parallel-all-settled decorator', () => {
  test('should execute the promises in parallel and return array of objects containing status and value for resolved, and reason and status for rejected', async () => {
    const error = new Error('no pets here!');

    const pipeline = pipe(
      parallelAllSettled(
        () => Promise.resolve({ id: 1, name: 'pet1' }),
        () => Promise.resolve({ id: 2, name: 'pet2' }),
        () => Promise.resolve({ id: 3, name: 'pet3' }),
        () => Promise.reject(error)
      )
    );

    await expect(pipeline({}, createContext({}), {} as BautaJSInstance)).resolves.toStrictEqual([
      { status: 'fulfilled', value: { id: 1, name: 'pet1' } },
      { status: 'fulfilled', value: { id: 2, name: 'pet2' } },
      { status: 'fulfilled', value: { id: 3, name: 'pet3' } },
      { reason: error, status: 'rejected' }
    ]);
  });
});
