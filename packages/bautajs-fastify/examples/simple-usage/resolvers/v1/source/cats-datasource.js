const { restProvider } = require('@axa/bautajs-datasource-rest');

// Used to test that an https works
const catsRestProviderWithHttps = restProvider(client => {
  return client.get('https://cat-fact.herokuapp.com/facts', {
    rejectUnauthorized: false
  });
});

module.exports = {
  catsRestProviderWithHttps
};
