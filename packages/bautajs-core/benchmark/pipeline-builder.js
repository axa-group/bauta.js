const { pipe } = require('../dist/index');
const { pipelineBuilder } = require('./legacy/pipeline');

const startParameters = ['hello', { data: {} }];
exports.compare = {
  'old pipeline builder': async function oldP() {
    const r = pipelineBuilder(p =>
      p.pipe(
        () => 'string',
        prev => `${prev}something`,
        (prev, ctx) => {
          ctx.data.something = prev;
        }
      )
    );
    await r(...startParameters);
  },
  'new pipeline builder': async function newP() {
    const r = pipe(
      () => 'string',
      prev => `${prev}something`,
      (prev, ctx) => {
        ctx.data.something = prev;
      }
    );

    await r(...startParameters);
  },
  'old pipeline builder - error': async function oldP() {
    const r = pipelineBuilder(p =>
      p
        .pipe(
          () => 'string',
          prev => `${prev}something`,
          (prev, ctx) => {
            ctx.data.something = prev;
            throw new Error('eyy');
          }
        )
        .onError(() => {
          return 'ok';
        })
    );
    await r(...startParameters);
  },
  'new pipeline builder - error': async function newP() {
    const r = pipe(
      () => 'string',
      prev => `${prev}something`,
      (prev, ctx) => {
        ctx.data.something = prev;
        throw new Error('eyy');
      }
    ).catchError(() => {
      return 'ok';
    });

    await r(...startParameters);
  },
  'old pipeline builder - two error catch': async function oldP() {
    const r1 = pipelineBuilder(p =>
      p
        .pipe(
          () => 'string',
          prev => `${prev}something`,
          (prev, ctx) => {
            ctx.data.something = prev;
            throw new Error('eyy');
          }
        )
        .onError(() => {
          return 'ok';
        })
    );
    const r = pipelineBuilder(p =>
      p
        .pipe(
          r1,
          () => 'string',
          prev => `${prev}something`,
          (prev, ctx) => {
            ctx.data.something = prev;
            throw new Error('eyy');
          }
        )
        .onError(() => {
          return 'ok';
        })
    );
    await r(...startParameters);
  },
  'new pipeline builder - two error catch': async function newP() {
    const r1 = pipe(
      () => 'string',
      prev => `${prev}something`,
      (prev, ctx) => {
        ctx.data.something = prev;
        throw new Error('eyy');
      }
    ).catchError(() => {
      return 'ok';
    });
    const r = pipe(
      r1,
      () => 'string',
      prev => `${prev}something`,
      (prev, ctx) => {
        ctx.data.something = prev;
        throw new Error('eyy');
      }
    ).catchError(() => {
      return 'ok';
    });

    await r(...startParameters);
  }
};
require('bench').runMain();
