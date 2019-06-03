import { BautaJS } from '@bautajs/core';
import { queryFilters } from '../index';

interface Req {
  headers: any;
  query: any;
}

interface Res {
  body: any;
  statusCode: number;
}
const bautajs = new BautaJS<Req, Res>([
  { openapi: '3.0', paths: {}, info: { title: 'ola', version: '1' } }
]);

bautajs.services.policies.v1.find.setup(pipeline =>
  pipeline
    .push(() => [6])
    .push(queryFilters())
    .push(prev => prev[0])
);
