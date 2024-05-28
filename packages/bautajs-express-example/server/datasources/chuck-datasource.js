import { getRequest } from '@axa/bautajs-express';
import { restProvider } from '@axa/bautajs-datasource-rest';

// Used to test that an https works
const chuckProvider = restProvider((client, _, ctx) => {
  const req = getRequest(ctx);
  return client.get(`https://api.chucknorris.io/jokes/search?query=${req.params.string}`, {
    rejectUnauthorized: false
  });
});

export { chuckProvider };
