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

## Four ways to setup a provider or datasource

To configure one or more calls to other services there are four ways:

- restProviderTemplate
- restDataSourceTemplate
- restProvider 
- restDataSource

### restProviderTemplate and restDataSourceTemplate (deprecated)

> Note: These two methods are disallowed and are deprecated. This explanation is minimum and we advice to use the other two methods to setup service calls.

These two functions allow the setup of services using the [json templating library stjs](https://github.com/SelectTransform/st.js/).

Using these two methods, we use the stjs templating capabilities to reference the different dynamic values that bauta uses. Since the datasources or providers used in every request are compiled on demand. It allow to add dynamic information into them, specifying properties from `value`, `ctx`, `$static` and `$env` objects.

 - `previousValue`: reference to the previous OperatorFunction result.
 - `ctx`: reference to the current context, see [Context interface](../packages/bautajs-core/src/utils/types.ts) for further information.
 - `$static`: reference to the $static generic data coming from the `bautajs` constructor parameter staticConfig.
 - `$env`: reference to the current NodeJS process.env.

#### restProviderTemplate

This is a setup for a given provider based in the [numbers-datasource.js](../packages/bautajs-example/server/resolvers/v1/source/numbers-datasource.js) example file:

```js
const { restProviderTemplate } = require('@bautajs/datasource-rest');

module.exports = restProviderTemplate(
  {
    options: {
      url: 'http://numbersapi.com/{{ctx.req.params.number}}/math',
      json: false
    }
  },
  { headers: '{{ctx.req.headers}}', json: true }
);
```

You can see that two objects are used, first object is the template for the specific provider definition:

```js
  {
    options: {
      url: 'http://numbersapi.com/{{ctx.req.params.number}}/math',
      json: false
    }
  }
```
and the second object is a options object that acts as default:

```js
  { headers: '{{ctx.req.headers}}', json: true }
```

Here we are configuring first that the service responds a json, a setting configuration that gets overwritting by the specific provider setting in the first object. Previous setup is to show the two objects and it could be simplified like this:

```js
const { restProviderTemplate } = require('@bautajs/datasource-rest');

module.exports = restProviderTemplate(
  {
    options: {
      url: 'http://numbersapi.com/{{ctx.req.params.number}}/math',
      json: false,
      headers: '{{ctx.req.headers}}'
    }
  }
);
```

#### restDataSourceTemplate

And this a similar setup but using a datasource based as well in the [numbers-datasource.js](../packages/bautajs-example/server/resolvers/v1/source/numbers-datasource.js) 

```js
const { restDataSourceTemplate } = require('@bautajs/datasource-rest');

module.exports = restDataSourceTemplate({
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
```

#### Differences between restProviderTemplate and restDataSourceTemplate

Besides the fact that the datasource is a grouping of different providers that may share common options, there are two main differences in setup between a provider and a datasource:
- **options**: In the restDataSourceTemplate the options can be grouped and set once for all the providers as in the example. 
- **id**: Since when using restDataSourceTemplate we may have more than one provider, each one requires a distinc and unique identifier, in the field id, which is not required in the restProviderTemplate.

### restProvider and restDataSource

> Note: These two methods should be the preferred way of configuring services. They offer the best readibility and maintainability. Template methods are being deprecated due to its overcomplexity and we strongly suggest not using them.

These two functions allow the setup of services using directly javascript. In this setup we must use the signature of an OperatorFunction.

This is a setup for a given provider based in the [numbers-datasource.js](../packages/bautajs-example/server/resolvers/v1/source/numbers-datasource.js) example file:

```js
const { restProvider } = require('@bautajs/datasource-rest');

module.exports = restProvider(
  {
    options(prv, ctx, $static) {
      return {
        url: `http://numbersapi.com/${ctx.req.params.number}/math`,
        json: false
      };
    }
  },
  (prv, ctx, $static) => {
    return { json: true, headers: ctx.req.headers };
  }
);
```

And this a similar setup but using a datasource based in the [numbers-datasource.js](../packages/bautajs-example/server/resolvers/v1/source/numbers-datasource.js) example file:

```js
const { restDataSource } = require('@bautajs/datasource-rest');

module.exports = restDataSource({
  providers: [
    {
      id: 'obtainRandomYearFact',
      options(prv, ctx, $static) {
        return {
          url: 'http://numbersapi.com/random/year',
          json: false
        };
      }
    }
  ],
  options(prv, ctx, $static) {
    return { json: true, headers: ctx.req.headers };
  }
});
```

### options

All the options that can be any of the [`https.request`](https://nodejs.org/api/https.html#https_https_request_options_callback) options. Since the options are based in the got options you can check as well in [got options](https://github.com/sindresorhus/got) documentation for details about the different options.

Besides that below is there a list with an explanation of the most important ones in relation to bauta.

#### stream

Type: `boolean`<br>
Default: `false`

If the endpoint being called by our provider returns an stream this option *must* be set to true.
Consideration: Do not confuse this field with isStream field of latest got version. Current got version used by bauta does not support isStream field.

#### formData

This field is used to specify a multipart/form-data request. See recipes section, multipart/form-data example for further details.

#### preambleCRLF
#### postambleCRLF

This two fields are used for own bauta implementation of multipart/related requests. See recipes section, multipart/related example for further details.

#### resolveBodyOnly
Type: `boolean`<br>
Default: `true`

When set to true we return the response body instead of the full response object. Set to false in special cases to get the full response object.

### recipes

There are some very specific cases in bauta that requires a non-trivial configuration. Below there is a list of those cases with an example of the required configuration.

#### mutual ssl with agent configuration

Bauta uses a default agent and you only need to pass the certificates to implement mutual ssl. 

```js
// my-datasource.js

const { restDataSource } = require('@bautajs/datasource-rest');

module.exports = restDataSource({
  providers: [
    {
      id: 'operation1',
      options(prv, ctx, $static) {
        return {
          url: 'http://myhost.com',
          headers: ctx.req.headers 
        };
      }
    }
  ],
  options(prv, ctx, $static) {
    return { 
      cert: $static.certs.cert,
      key: $static.certs.key
    };
  }
});
```
Note: you must make sure that at loading system, bauta loads the corresponding certificates and set them in the variable you will use in your datasources.

#### customize agent configuration

- How to customize your agent:
  To customize your agent you can simply add the `agent` field. We recomend to use `createForeverAgent, createHttpForeverAgent and createHttpsForeverAgent` from [native-proxy-agent](https://github.axa.com/Digital/amf-commons-nodejs/tree/master/packages/native-proxy-agent) that give the following features:
    -   http_proxy and https_proxy environment variables
    -   Request using custom certificates throught 'agentOptions.cert' and 'agentOptions.key' native NODEJS fields
    -   StricSSL enable throught 'rejectUnauthorized' field
    -   keepAlive option by default and 'keepAliveMsec' fields
```js
// my-datasource.js
const { createHttpForeverAgent } =  require('native-proxy-agent');
const { restDatasource } =  require('@bautajs/datasource-rest');
module.exports = restDatasource({
  "providers": [
    {
      id: "operation1",
      options(prv, ctx, $static) {
        return {
          url: 'http://myhost.com',
          agent: createHttpForeverAgent({
            cert: $static.certs.cert,
            key: $static.certs.key,
            proxy: '192.120.3.4:80'
          })
        };
      }
    }
  ]
}) 
```

Note: A very common use case for this kind of configuration is to need proxy configured. proxy field is an agent parameter and you cannot set it directly bauta configuration (it has to be inside the agent as in the example).

#### disable proxy with agent configuration

To disable the proxy even using proxy env variables just set agent null on the request you need it or create a new Agent without proxy

```js
// my-datasource.js
const { createHttpForeverAgent } =  require('native-proxy-agent');
const { restDatasource } =  require('@bautajs/datasource-rest');
module.exports = restDatasource({
  "providers": [
  {
    id: "operation1",
    options: {
      url: 'http://myhost.com',
      agent: null
    }
  }
  ]
}) 
```

#### multipart/form-data 

As for `multipart/related`, `bautajs` provides its own implementation for `multipart/form-data`.

```js
// my-datasource.json
const { restDataSource } = require('@bautajs/datasource-rest');

module.exports = restDataSource({
  "providers": [
    {
      "id": "operation1",
      options(prv, ctx, $static) { // In a real case you would set the filenames and data below from fields from ctx.data
        return {
          formData: {
            // Pass a simple key-value pair
            my_field: 'my_value',
            // Pass data via Buffers
            my_buffer: Buffer.from([1, 2, 3]),
            // Pass data via Streams
            my_file: fs.createReadStream(__dirname + '/unicycle.jpg'),
            // Pass multiple values /w an Array
            attachments: [
              fs.createReadStream(__dirname + '/attachment1.jpg'),
              fs.createReadStream(__dirname + '/attachment2.jpg')
            ],
            // Pass optional meta-data with an 'options' object with style: {value: DATA, options: OPTIONS}
            // Use case: for some types of streams, you'll need to provide "file"-related information manually.
            // See the `form-data` README for more information about options: https://github.com/form-data/form-data
            file: {
              value:  fs.createReadStream('/file'),
              options: {
                filename: 'someImage.jpg',
                contentType: 'image/jpeg'
              }
            }
          }
      }
    }
  }
  ]
}) 
```

#### multipart/related

[got][https://github.com/sindresorhus/got] do not come with `multipart/related` out of the box.
Thus, `bautajs` add it to be available at the operations datasources requests.
`bautajs` follows the way [request/request][https://github.com/request/request#multipartrelated] implements `multipart/related` by using [multipart-request-builder][../packages/multipart-request-builder].

```js
// my-datasource.js
const { restDataSource } = require('@bautajs/rest-datasource');
module.exports = restDataSource({
    "providers":  [
      {
        "id": "operation1",
        options() {
          return {
            "headers": {
              "content-type": "multipart/related"
            },
            "preambleCRLF": true,
            "postambleCRLF": true,
            multipart: [
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
            ],
            // alternatively pass an object containing additional options multipart: 
            multipart: {
              chunked: false,
              data: [
                {
                  'content-type': 'application/json',
                  body: JSON.stringify({
                    foo: 'bar',
                    _attachments: {
                      'message.txt': {
                        follows: true,
                        length: 18,
                        'content_type': 'text/plain'
                      }
                    }
                  })
                },
                {
                  body: 'I am an attachment'
                }
              ]
            }
          }
        }
      }
    ]
})
```