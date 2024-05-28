// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getRequest } from '@axa/bautajs-express';
import { restProvider } from '@axa/bautajs-datasource-rest';

const exampleRestProviderYear = restProvider((client, _prv, ctx) => {
  const req = getRequest(ctx);
  return client.get('http://numbersapi.com/random/year?json', {
    headers: req.headers
  });
});

const exampleRestProvider = restProvider((client, _prv, ctx) => {
  const req = getRequest(ctx);
  return client.get(`http://numbersapi.com/${req.params.number}/math`, {
    responseType: 'text',
    resolveBodyOnly: true,
    headers: req.headers
  });
});

export { exampleRestProviderYear, exampleRestProvider };
