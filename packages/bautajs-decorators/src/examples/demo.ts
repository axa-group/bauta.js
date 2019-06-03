import { BautaJS } from '@bautajs/core';
import { asCallback } from '../decorators/as-callback';
import { asValue } from '../decorators/as-value';
import { parallel } from '../decorators/parallel';
import { request } from '../decorators/request';
import { template } from '../decorators/template';

interface Req {
  headers: any;
  query: any;
}

interface Res {
  body: any;
  statusCode: number;
}
const bautajs = new BautaJS<Req, Res>([
  { openapi: '3.0', paths: {}, info: { title: 'hola', version: '1' } }
]);

bautajs.services.policies.v1.find.setup(pipeline =>
  pipeline
    .push(() => 6)
    .push(
      asCallback((num, _, done) => {
        done(null, num);
      })
    )
    .push(asValue('string'))
    .push(request({ resolveBodyOnly: true }))
    .push(
      template({
        acceptHeader: '{{ctx.req.headers.accept}}',
        id: '{{previousValue.id}}',
        myEnv: '{{env.myEnv}}'
      })
    )
    .push(
      parallel(
        () => 1,
        () => '',
        () => 1,
        () => '',
        () => 1,
        () => '',
        () => 1,
        () => '',
        () => 1,
        () => ''
      )
    )
    .push(prev => prev[2].toString())
);
