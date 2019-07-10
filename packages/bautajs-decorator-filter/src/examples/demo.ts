import { BautaJS } from '@bautajs/core';
import { queryFilters } from '../index';

const bautajs = new BautaJS([{ openapi: '3.0', paths: {}, info: { title: 'ola', version: '1' } }]);

bautajs.services.policies.v1.find.setup(pipeline =>
  pipeline
    .push(() => [6])
    .push(queryFilters())
    .push(prev => prev[0])
);
