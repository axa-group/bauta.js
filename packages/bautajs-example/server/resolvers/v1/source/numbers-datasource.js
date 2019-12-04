const {
  restDataSourceTemplate,
  restDataSource,
  restProvider,
  restProviderTemplate
} = require('@bautajs/datasource-rest');

const exampleRestDataSourceTemplate = restDataSourceTemplate({
  providers: [
    {
      id: 'obtainRandomYearFact',
      options: {
        url: 'http://numbersapi.com/random/year',
        json: false
      }
    }
  ],
  options: { headers: '{{ctx.req.headers}}', json: true }
});

const exampleRestProviderTemplate = restProviderTemplate(
  {
    options: {
      url: 'http://numbersapi.com/{{ctx.req.params.number}}/math',
      json: false
    }
  },
  { headers: '{{ctx.req.headers}}', json: true }
);

const exampleRestDataSource = restDataSource({
  providers: [
    {
      id: 'obtainRandomYearFact',
      options(prv, ctx, static) {
        return {
          url: 'http://numbersapi.com/random/year',
          json: false
        };
      }
    }
  ],
  options(prv, ctx, static) {
    return { json: true, headers: ctx.req.headers };
  }
});

const exampleRestProvider = restProvider(
  {
    options(prv, ctx, static) {
      return {
        url: `http://numbersapi.com/${ctx.req.params.number}/math`,
        json: false
      };
    }
  },
  (prv, ctx, static) => {
    return { json: true, headers: ctx.req.headers };
  }
);

module.exports = {
  exampleRestDataSourceTemplate,
  exampleRestDataSource,
  exampleRestProviderTemplate,
  exampleRestProvider
};
