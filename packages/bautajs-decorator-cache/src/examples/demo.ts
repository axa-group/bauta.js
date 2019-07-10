import { BautaJS } from '@bautajs/core';
import { cache } from '../index';

const bautajs = new BautaJS([{ openapi: '3.0', paths: {}, info: { title: 'ola', version: '1' } }]);
bautajs.services.policies.v1.find.setup(pipeline =>
  pipeline
    .push(() => 6)
    .push(
      cache(
        p => p.push(prev => prev.toString()).push(prev => prev.toLocaleLowerCase()),
        ([value]) => value.toString()
      )
    )
);
