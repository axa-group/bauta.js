# Providers and Datasources

In a bauta middleware there must be a *Provider* for each call to a third party service that is being used.

A set of Providers may be grouped together to share configuration or properties and this is called *Datasource*

Simply put, for each call to another service that a bauta middleware requires, there has to be a *Provider* set up, using one of the four possible ways described below.

## How to use a Datasource

To define a datasource or provider, you must require and install the type of datasource that you require.

## List of support datasources

Currently we support the following types of datasources:

| Component to Install     | Type of Datasource| Description                                                         |
|--------------------------|-------------------|---------------------------------------------------------------------|
| @bautajs/datasource-rest | REST calls        | REST HTTP requests using [Got](https://github.com/sindresorhus/got) |

# REST Providers and Datasources

In the rest of this section we describe how to create datasources and providers to setup REST calls. 

## How to configure a datasource provider

### restProvider

This function will give a got client *with* [resolvebodyonly](https://github.com/sindresorhus/got#resolvebodyonly) *equals to true* and [responseType](https://github.com/sindresorhus/got#responseType) *equals to json* as is a *rest* datasource the default response type is *json*.

This is a setup for a given provider based in the [numbers-datasource.js](../packages/bautajs-example/server/resolvers/v1/source/numbers-datasource.js) example file:

```js
const { getRequest } = require('@bautajs/express');
const { restProvider } = require('@bautajs/datasource-rest');

module.exports.exampleRestProvider = restProvider((client, prv, ctx) => {
      const req = getRequest(ctx);
      return client.get(`http://numbersapi.com/${req.params.number}/math`,{
        headers: req.headers
      });
    }
);
```

You can always override the options with one of the [got options](https://github.com/sindresorhus/got).

```js
const { getRequest } = require('@bautajs/express');
const { restProvider } = require('@bautajs/datasource-rest');

module.exports.exampleRestProviderAsTxt = restProvider((client, prv, ctx) => {
      const req = getRequest(ctx);
      return client.get(`http://numbersapi.com/${req.params.number}/math`,{
        responseType: 'text',
        headers: req.headers
      });
    }
);
```

### options

All the options that can be any of the [got options](https://github.com/sindresorhus/got).

Besides that below is there a list with an explanation of the most important ones in relation to bauta.

### recipes

There are some very specific cases in bauta that requires a non-trivial configuration. Below there is a list of those cases with an example of the required configuration.

#### mutual ssl with agent configuration

Bauta uses a default agent and you only need to pass the certificates to implement mutual ssl. 

```js
// my-datasource.js

const { getRequest } = require('@bautajs/express');
const { restProvider } = require('@bautajs/datasource-rest');

module.exports.someProvider = restProvider((client, prv, ctx, bautajs) =>  {
        const req = getRequest(ctx);
        return client.get('http://myhost.com', {
          headers: req.headers,
          cert: bautajs.staticConfig.certs.cert,
          key: bautajs.staticConfig.certs.key
        });
      }
    });
```
Note: you must make sure that at loading system, bauta loads the corresponding certificates and set them in the variable you will use in your datasources.

#### customize agent configuration

- How to customize your agent:
  To customize your agent you can simply add the `agent` field. We recommend to use `createForeverAgent, createHttpForeverAgent and createHttpsForeverAgent` from [native-proxy-agent](https://github.axa.com/Digital/native-proxy-agent) that give the following features:
    -   http_proxy and https_proxy environment variables
    -   Request using custom certificates through 'agentOptions.cert' and 'agentOptions.key' native NODEJS fields
    -   StricSSL enable through 'rejectUnauthorized' field
    -   keepAlive option by default and 'keepAliveMsec' fields
```js
// my-datasource.js
const { createHttpForeverAgent } =  require('native-proxy-agent');
const { restProvider } =  require('@bautajs/datasource-rest');
module.exports.someProvider = restProvider((client, prv, ctx, bautajs) => {
        return client.get('http://myhost.com', {
          agent: createHttpForeverAgent({
            cert: bautajs.staticConfig.certs.cert,
            key: bautajs.staticConfig.certs.key,
            proxy: '192.120.3.4:80'
          })
        });
});
```

Note: A very common use case for this kind of configuration is to need proxy configured. proxy field is an agent parameter and you cannot set it directly bauta configuration (it has to be inside the agent as in the example).

#### disable proxy with agent configuration

To disable the proxy even using proxy env variables just set agent null on the request you need it or create a new Agent without proxy

```js
// my-datasource.js
const { createHttpForeverAgent } =  require('native-proxy-agent');
const { restProvider } =  require('@bautajs/datasource-rest');
module.exports = restProvider((client) => {
  return client.get('http://myhost.com', { agent: null });
}) 
```

#### multipart/form-data 

To create a `multipart/form-data` we strongly recommend to use [form-data](https://github.com/form-data/form-data).

```js
// my-datasource.js
const fs = require('fs');
const { restProvider } = require('@bautajs/rest-datasource');
const FormData = require('form-data');

module.exports.somProvider = restProvider((client) =>{
    const form = new FormData();
    form.append('my_file', fs.createReadStream('/foo/bar.jpg'));
      
    return client.get('https://test.com/url', {
       body: form
    });
});
```


More info can be found on [Got](https://github.com/sindresorhus/got#form-data);

#### multipart/related

[got][https://github.com/sindresorhus/got] do not come with `multipart/related` out of the box as same as `bautajs/datasource-rest`.

But you can implemented using [multipart-request-builder](https://github.axa.com/Digital/multipart-request-builder);
```js
// my-datasource.js
const { restProvider } = require('@bautajs/rest-datasource');
const { Multipart } = require('multipart-request-buldier');

module.exports.someProvider = restProvider((client) =>{
      const options = {
        preambleCRLF: true,
        postambleCRLF: true
      };
      const multipartInstance = new Multipart(options);
      const reqOptions = [
              {
                'content-type': 'application/json',
                body: JSON.stringify({
                  foo: 'bar',
                  _attachments: {
                    'message.txt': {
                      follaws: true,
                      length: 18,
                      'content_type': 'text/plain'
                    }
                  }
                })
              },
              {
                body: 'I am an attachment'
              },
              {
                body: fs.createReadStream('image.png')
              }
      ];
      const { body, headers } = multipartInstance.buildRequest(reqOptions);

     return client.get('https://test.com/url', {
       body,
       headers
     });
});
```

### Create your own restProvider

This case can be useful if you need to maintain the same got client configuration for different providers.

```js
  // my-datasource.js
const { getRequest } = require('@bautajs/express');
const { restProvider } = require('@bautajs/datasource-rest');

const myCache = new Map();
const myTextProvider = restProvider.extend({ cache: myCache });

module.exports.testProvider = myTextProvider((client, _, ctx, bautajs) => {
  const req = getRequest(ctx);
  const acceptLanguage = !req.headers.accept-language? 'my default lang' : req.headers['accept-language'];

  return client.get(bautajs.staticConfig.config.url, {
    headers: {
      "Accept-Language": acceptLanguage,
      "user-agent": req.headers['user-agent']
    }s
  })
});
```

## Logger

Request and response are logged out of the box in the following format:

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

**Request and response body are automatically hidden if they exceeds the maxBodyLogSize that by default is 1024 bytes.**