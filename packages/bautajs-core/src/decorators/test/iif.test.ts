import fs from 'fs';
import path from 'path';
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

  test('should work even if the result of the if is a promise', async () => {
    const saveEarthPipeline = pipe(() => 'Plastic is not fantastic!');
    const plasticLoversPipeline = pipe(() => 'Plastic is fantastic!');
    const myBigIf = pipe(async (prev: any) =>
      Promise.resolve(prev.includes('Plastic is fantastic!'))
    );

    const pipeline = pipe(saveEarthPipeline, iif(myBigIf, plasticLoversPipeline));

    expect(pipeline({}, createContext({}), {} as BautaJSInstance)).toBe(
      'Plastic is not fantastic!'
    );
  });

  test('should mark only the deprecated generic type as deprecated in overload declaration', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../iif.ts'), 'utf8');
    const firstOverloadIndex = source.indexOf('export function iif<');
    const firstOverloadEndIndex = source.indexOf(
      '): Pipeline.StepFunction<TIn, TIn | TPipelineOut>;',
      firstOverloadIndex
    );
    const firstOverload = source.slice(firstOverloadIndex, firstOverloadEndIndex);

    expect(source.slice(0, firstOverloadIndex)).not.toContain('@deprecated');
    expect(firstOverload).toContain('@deprecated');
    expect(firstOverload).toContain('TElseNever');
  });
});
