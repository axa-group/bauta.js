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
import { pipe } from '../pipeline';
import { match } from '../match';
import { createContext } from '../../utils/create-context';
import { BautaJSInstance } from '../..';

describe('match decorator', () => {
  test('should select the pipeline execution depending on the condition', async () => {
    const myPipeline1 = pipe(() => [{ id: 1, name: 'pet' }]);
    const myPipeline2 = pipe(() => [{ id: 3, name: 'pet' }]);
    const pipeline = pipe(
      () => 1,
      match(m => m.on(prev => prev === 1, myPipeline1).otherwise(myPipeline2))
    );

    expect(pipeline(null, createContext({}), {} as BautaJSInstance)).toStrictEqual([
      { id: 1, name: 'pet' }
    ]);
  });

  test('should use the default option if non of the options match', async () => {
    const myPipeline1 = pipe(() => [{ id: 1, name: 'pet' }]);
    const myPipeline2 = pipe(() => [{ id: 3, name: 'pet' }]);
    const pipeline = pipe(
      () => 5,
      match(m =>
        m
          .on(prev => prev === 1, myPipeline1)
          .on(prev => prev === 2, myPipeline1)
          .otherwise(myPipeline2)
      )
    );

    expect(pipeline(null, createContext({}), {} as BautaJSInstance)).toStrictEqual([
      { id: 3, name: 'pet' }
    ]);
  });
});
