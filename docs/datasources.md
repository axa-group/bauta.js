# Datasources

Bauta.js born with the aim of implements Node.js APIs that behaves like a middleware to others third parties APIs. With that premise on mind, Bauta.js has the concept of HTTP request datasources. A Bauta.js request datasource is an abstraction of an http(s) request to a third party API. It's based on the request library [got](https://github.com/sindresorhus/got) and Bauta.js enrich its behaviour adding useful logs and http(s) proxy suppport and request cancellation. A datasource can be use as a step function inside any Bauta.js pipeline.

## restProvider

This method will return a got client initizialized *with* [resolvebodyonly](https://github.com/sindresorhus/got#resolvebodyonly) enabled and [responseType](https://github.com/sindresorhus/got#responseType) as `json`.

### Example

The following example can be found on [numbers-datasource.js](../packages/bautajs-example/server/resolvers/v1/source/numbers-datasource.js) example file:

```js
const { getRequest } = require('@axa-group/bautajs-express');
const { restProvider } = require('@axa-group/bautajs-datasource-rest');

module.exports.exampleRestProvider = restProvider((client, prv, ctx) => {
      const req = getRequest(ctx);
      return client.get(`http://numbersapi.com/${req.params.number}/math`,{
        headers: req.headers
      });
    }
);
```

You can override the default options with one of the possible [got options](https://github.com/sindresorhus/got).

```js
const { getRequest } = require('@axa-group/bautajs-express');
const { restProvider } = require('@axa-group/bautajs-datasource-rest');

module.exports.exampleRestProviderAsTxt = restProvider((client, prv, ctx) => {
      const req = getRequest(ctx);
      return client.get(`http://numbersapi.com/${req.params.number}/math`,{
        responseType: 'text',
        headers: req.headers
      });
    }
);
```

### Proxy support

Bauta.js datasources supports coorporative proxys using [@axa-group/native-proxy-agent](https://github.com/axa-group/native-proxy-agent).

### Extending the restProvider

This case can be useful if you need to maintain the same got client configuration for different providers.

If you need to share the same got client configuration accross multiple datasources, you can follow the next approach to avoid repeating the configuration everytime. In this example, we are creating the got client with a known prefix URL.

```js
  // my-datasource.js
const { getRequest } = require('@axa-group/bautajs-express');
const { restProvider } = require('@axa-group/bautajs-datasource-rest');

const myCache = new Map();
const myTextProvider = restProvider.extend({ prefixUrl: 'https://mymoviesdb.com'});

module.exports.testProvider = myTextProvider((client, _, ctx, bautajs) => {
  const req = getRequest(ctx);
  // => GET https://mymoviesdb.com/movies
  return client.get('/movies')
});
```

### Logging

Bauta.js logs in every datasource execution information that can be used for debugging your applications.

```json
   datasourceReq: {
      "url": "https://test.com",
      "method": "GET",
      "query": {}
    }
    datasourceRes: {
      "responseTime": 362,
      "statusCode": 200,
      "headers": {
        "server-timing": "dtRpid;desc=\"1417506222\"",
        "x-oneagent-js-injection": "true",
        "cache-control": "no-transform, max-age=86400",
        "x-powered-by": "bar",
        "etag": "\"1621925860000-10749\"",
        "last-modified": "Tue, 25 May 2021 06:57:40 GMT",
        "referer": "",
        "content-encoding": "gzip",
        "content-type": "application/json",
        "content-length": "2923",
        "date": "Tue, 26 Oct 2021 11:55:13 GMT",
        "connection": "close",
        "server": "server"
      },
      "body": {
        "type": "json",
        "byteLength": 10749,
        "reason": "Body exceeds the limit of 1024 bytes.",
      }
    }
    reqId: "req-1"
    module: "@bautajs/datasource"
```

#### Configuration

Request and response body are automatically hidden if they exceeds the `maxBodyLogSize` that by default is 16kB. To modify this value you have two options;

1. Configure it into the `bautajs` staticConfig

```js
const { BautaJS } = require('@axa-group/bautajs-core');


const bautajs = new BautaJS({ staticConfig: { maxBodyLogSize: 1024  } });
```

2. Configure it into every restProvider:


```js
// my-datasource.js
const { restProvider } =  require('@axa-group/bautajs-datasource-rest');
module.exports = restProvider((client) => {
  return client.get('http://myhost.com');
}, { maxBodyLogSize: 1024 })
```

The logging of the request and response headers and body are controlled via the `logger.level` property. Set to debug, trace, or it is less than `20`, the datasource behaves as debug mode printing all the mentioned information.

This behaviour can be override by setting up the configuration option `ignoreLogLevel` set to true on the rest providers. If this toggle is enabled, all data will be logged in any log level value.
