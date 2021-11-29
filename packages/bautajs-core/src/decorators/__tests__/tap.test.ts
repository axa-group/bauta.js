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

import { BautaJSInstance, createContext, pipe, step } from '../..';
import { tap } from '../tap';

describe('tap decorator', () => {
  test('should perform the current step action but return the previous step value', async () => {
    const log = jest.fn();
    const getMovie = step(() => ({ name: 'star wars' }));
    const logMovieName = step<{ name: string }, { name: string }>(({ name }) => log(name));

    const pipeline = pipe(getMovie, tap(logMovieName));

    expect(pipeline({}, createContext({}), {} as BautaJSInstance)).toStrictEqual({
      name: 'star wars'
    });

    expect(log).toHaveBeenCalledWith('star wars');
  });
});
