import { BautaJS, createContext, pipelineBuilder, Document } from '@bautajs/core';
import nock from 'nock';
import { Provider, restProvider } from '../src';

const apiDefinitions = require('./test-api-definitions.json');

interface myServiceResponse {
  done: String;
}

nock('http://test.com').get('/someurl').reply(200, {
  done: 'ok'
});

const myProvider = <Provider<myServiceResponse>>restProvider(client => {
  return client.get('http://test.com/someurl', {
    resolveBodyOnly: true,
    responseType: 'json'
  });
});

const myPipeline = pipelineBuilder(p =>
  p.pipe(
    () => {
      return 'test string';
    },
    myProvider(),
    val => {
      return val.done;
    }
  )
);

const myLogger = { ...console, fatal: () => {}, child: () => myLogger };

(async () => {
  const bauta = new BautaJS(apiDefinitions as Document[]);
  // eslint-disable-next-line no-console
  console.log(await myPipeline(null, createContext({}, myLogger), bauta));
})();
