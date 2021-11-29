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
import { iif } from '../iif';

describe('iif decorator', () => {
  test('should execute pipeline if the condition is truthy', async () => {
    const randomPreviousPipeline = pipe(() => 'I am so random!');
    const manageOnlyStringsPipeline = pipe(() => 'I can manage only strings, otherwise I crash');

    const pipeline = pipe(
      randomPreviousPipeline,
      iif(prev => typeof prev === 'string', manageOnlyStringsPipeline)
    );

    expect(pipeline({}, createContext({}), {} as BautaJSInstance)).toBe(
      'I can manage only strings, otherwise I crash'
    );
  });

  test('should execute elsePipeline if it is defined and the result condition is falsy', async () => {
    const randomPreviousPipeline = pipe(() => []);
    const manageOnlyStringsPipeline = pipe(() => 'I can manage only strings, otherwise I crash');
    const elsePipeline = pipe(() => 'I am a pipeline in an else path');

    const pipeline = pipe(
      randomPreviousPipeline,
      iif(prev => typeof prev === 'string', manageOnlyStringsPipeline, elsePipeline)
    );

    expect(pipeline({}, createContext({}), {} as BautaJSInstance)).toBe(
      'I am a pipeline in an else path'
    );
  });

  test('should do a passthrough of the first value if the result condition is falsy and elsePipeline is not defined', async () => {
    const saveEarthPipeline = pipe(() => 'Plastic is not fantastic!');
    const plasticLoversPipeline = pipe(() => 'Plastic is fantastic!');

    const pipeline = pipe(
      saveEarthPipeline,
      iif((prev: any) => prev.includes('Plastic is fantastic!'), plasticLoversPipeline)
    );

    expect(pipeline({}, createContext({}), {} as BautaJSInstance)).toBe(
      'Plastic is not fantastic!'
    );
  });
});
