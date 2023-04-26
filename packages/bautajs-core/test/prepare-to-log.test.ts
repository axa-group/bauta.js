import { prepareToLog } from '../src/utils/prepare-to-log';

import smallObject from './fixtures/small-object-less-than-3200-size.json';

describe('prepareToLog tests', () => {
  test('should return unaffected object if it is smaller than the default size', () => {
    const result = prepareToLog(smallObject);

    expect(result).toBe(
      '{"quiz":{"sport":{"q1":{"question":"Which one is correct team name in NBA?","options":["New York Bulls","Los Angeles Kings","Golden State Warriros","Huston Rocket"],"answer":"Huston Rocket"}},"maths":{"q1":{"question":"5 + 7 = ?","options":["10","11","12","13"],"answer":"12"},"q2":{"question":"12 - 8 = ?","options":["1","2","3","4"],"answer":"4"}}}}'
    );
  });

  test('should return unaffected object if it is smaller than the non default size', () => {
    const result = prepareToLog(smallObject, 999999);

    expect(result).toBe(
      '{"quiz":{"sport":{"q1":{"question":"Which one is correct team name in NBA?","options":["New York Bulls","Los Angeles Kings","Golden State Warriros","Huston Rocket"],"answer":"Huston Rocket"}},"maths":{"q1":{"question":"5 + 7 = ?","options":["10","11","12","13"],"answer":"12"},"q2":{"question":"12 - 8 = ?","options":["1","2","3","4"],"answer":"4"}}}}'
    );
  });

  test('should return truncated object if it is smaller than the non default size', () => {
    const result = prepareToLog(smallObject, 60);

    expect(result).toBe('{"quiz":{"sport":{"q1":{"question":"Which one is correct tea...');
  });

  test('should return unaffected object if disable truncate is true', () => {
    const result = prepareToLog(smallObject, 999, true);

    expect(result).toBe(
      '{"quiz":{"sport":{"q1":{"question":"Which one is correct team name in NBA?","options":["New York Bulls","Los Angeles Kings","Golden State Warriros","Huston Rocket"],"answer":"Huston Rocket"}},"maths":{"q1":{"question":"5 + 7 = ?","options":["10","11","12","13"],"answer":"12"},"q2":{"question":"12 - 8 = ?","options":["1","2","3","4"],"answer":"4"}}}}'
    );
  });

  test('should return unaffected string if it is smaller than the default size', () => {
    const result = prepareToLog('this is a simple log');

    expect(result).toBe('this is a simple log');
  });

  test('should return unaffected string if it is smaller than the non default size', () => {
    const result = prepareToLog('this is a simple log', 99);

    expect(result).toBe('this is a simple log');
  });

  test('should return truncated string if it is smaller than the non default size', () => {
    const result = prepareToLog('this is a simple log that was a bit longer than needed', 20);

    expect(result).toBe('this is a simple log...');
  });

  test('should return unaffected string if disable truncate is true', () => {
    const result = prepareToLog('this is a simple log that was a bit longer than needed', 2, true);

    expect(result).toBe('this is a simple log that was a bit longer than needed');
  });
});
