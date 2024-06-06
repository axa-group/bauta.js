import { sortRoutes } from '../src/routes-order.js';

describe('sortRoutes', () => {
  test('should work with the order as expected without optional parameters', () => {
    const input = [
      '*',
      'bautajs/specific',
      'bautajs/*',
      'bautajs/:key',
      'bautajs/inner/:key',
      'bautajs/inner/specific'
    ];
    const result = sortRoutes(input);

    expect(result).toStrictEqual([
      'bautajs/specific',
      'bautajs/inner/specific',
      'bautajs/:key',
      'bautajs/inner/:key',
      'bautajs/*',
      '*'
    ]);
  });

  test('should work with the order as expected with optional parameters', () => {
    const input = [
      'bautajs/specific',
      'bautajs/*',
      'bautajs/:key?',
      'bautajs/inner/:key?',
      'bautajs/inner/specific',
      'bautajs/inner/*',
      'bautajs'
    ];
    const result = sortRoutes(input);

    expect(result).toStrictEqual([
      'bautajs/specific',
      'bautajs/inner/specific',
      'bautajs/:key?',
      'bautajs/inner/:key?',
      'bautajs/*',
      'bautajs/inner/*',
      'bautajs'
    ]);
  });

  test('should not modify input array', () => {
    const input = [
      'bautajs/specific',
      'bautajs/*',
      'bautajs/:key?',
      'bautajs/inner/:key?',
      'bautajs/inner/specific',
      'bautajs/inner/*',
      'bautajs'
    ];

    sortRoutes(input);

    expect(input).toStrictEqual([
      'bautajs/specific',
      'bautajs/*',
      'bautajs/:key?',
      'bautajs/inner/:key?',
      'bautajs/inner/specific',
      'bautajs/inner/*',
      'bautajs'
    ]);
  });
});
