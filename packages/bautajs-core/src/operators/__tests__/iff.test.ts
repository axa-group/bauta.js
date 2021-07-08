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

import { BautaJSInstance, createContext, pipe } from '../..';
import { iff } from '../iff';

describe('iff decorator', () => {
  test('should execute pipeline if the condition is truthy', async () => {
    const randomPreviousPipeline = pipe(() => 'I am so random!');
    const manageOnlyStringsPipeline = pipe(() => 'I can manage only strings, otherwise I crash');

    const pipeline = pipe(
      randomPreviousPipeline,
      iff(prev => typeof prev === 'string', manageOnlyStringsPipeline)
    );

    expect(await pipeline({}, createContext({}), {} as BautaJSInstance)).toStrictEqual(
      'I can manage only strings, otherwise I crash'
    );
  });

  test('should not execute the given pipeline if the condition is falsy, doing passthrough of the first value', async () => {
    const saveEarthPipeline = pipe(() => 'Plastic is not fantastic!');
    const plasticLoversPipeline = pipe(() => 'Plastic is fantastic!');

    const pipeline = pipe(
      saveEarthPipeline,
      iff((prev: any) => prev.includes('Plastic is fantastic!'), plasticLoversPipeline)
    );

    expect(await pipeline({}, createContext({}), {} as BautaJSInstance)).toStrictEqual(
      'Plastic is not fantastic!'
    );
  });
});
