### Datasource

The datasources are simple conectors or data providers for your middleware.

### Define a datasource

To define a datasource, install the type of datasource you need for example: `@bautajs/datasource-rest` for rest providers, so each provider of this datasource type will represents a HTTP request (using [Got][https://github.com/sindresorhus/got]).

### Datasource structure

Rest datasources must be compliant with the [RestDataSource](./packages/bautajs-datasource-rest/src/utils/types.ts), this might not be applicable for other type of datasources.

### Example

This is a datasource example:

```js
const { restDataSource } = require('@bautajs/datasource-rest');

module.exports = restDataSource({
  "providers":[
     {
       "id":"test",
       "options":{
         "url":"http://myserver.com",
         "json": true,
         "headers": {
           "Accept":"application-json"
         }
       }
     }
   ]
}
```

### Dynamic datasources

Datasources used in every request are compiled on demand. It allow to add dynamic information into them, specifying properties from `value`, `ctx`, `$static` and `$env` objects. 
 - `previousValue`: reference to the previous OperatorFunction result.
 - `ctx`: reference to the current context, see (Context interface)[./src/utils/types.ts] Context.
 - `$static`: reference to the $static generic data coming from the `bautajs` constructor parameter staticConfig.
 - `$env`: reference to the current NodeJS process.env.

```js
const { restDataSource } = require('@bautajs/datasource-rest');

module.exports = restDataSource({
  providers:[
    {
      id:"test",
      options(previousValue, ctx, $static){
        const acceptLanguage = !ctx.req.headers.accept-language? 'my default lang' : ctx.req.headers['accept-language'];

        return {
          url: $static.config.url,
          json: true,
          headers: {
            "Accept-Language": acceptLanguage,
            "user-agent": ctx.req.headers['user-agent']
          }
        }
      }
    }
  ]
});
```

`Once the dynamic data is resolved, the fields with`undefined`or`null\` values, are removed from the request as [got definitions][https://github.com/sindresorhus/got].

Alternative you can also use a datasource template:

```js
const { restDataSourceTemplate } = require('@bautajs/datasource-rest');

module.exports = restDataSourceTemplate({
  providers:[
    {
      id:"test",
      options: {
          url: '{{$static.config.url}}',
          json: true,
          headers: {
            "Accept-Language": '{{ctx.data.acceptLanguage}}',
            "user-agent": '{{ctx.req.headers['user-agent']}}'
          }
      }
    }
  ]
});
```

### Datasource usage

Datasource can be used on the resolvers as an OperatorFunction.

With the given datasource:

```js
// my-datasource.js
const { restDataSourceTemplate } = require('@bautajs/datasource-rest');

module.exports = restDataSourceTemplate({
  providers:[
    {
      id:"test",
      options: {
          url: '{{$static.config.url}}',
          json: true,
          headers: {
            "Accept-Language": '{{ctx.data.acceptLanguage}}',
            "user-agent": '{{ctx.req.headers['user-agent']}}'
          }
      }
    }
  ]
});
```

You can request it from your resolvers like this:

```js
const { resolver } = require('@bautajs/core');
const { test } = require('./my-datasource');

module.exports = resolver((operations) => {
  operations.v1.findCats.setup(p => 
    p.pipe(test())
  )
});
```

The providers are exported by your resolver as an object with the provider.id name. Do not worry if you make a mistake on the provider name, you will get a nice error message on running time.

- Providers are a functions ready to do the request to your provider but you can also just compile the datasource an do the request after do some logic.

```js
const { resolver } = require('@bautajs/core');
const { test } = require('./my-datasource');

module.exports = resolver((operations) => {
  operations.v1.findCats.setup(p => 
    p.pipe(test.compile((val,ctx,bautajs,provider) => {
      return provider.request({resolveFullBody: true});
    }))
  )
});
```


### multipart/related requests

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

### multipart/form-data requests

As for `multipart/related`, `bautajs` provides its own implementation for `multipart/form-data`.

```js
// my-datasource.json
// multipart/related without streams
const { restDataSource } = require('@bautajs/datasource-rest');

module.exports = restDataSource({
  "providers": [
    {
      "id": "operation1",
      options() {
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

### Request like features

To help on the transition from `request` to `got`, there are some alias and helpfull fields that feels like still using request library:

-   Use 'json' as an object to POST json data (content-type: application/json):

```json
  {
    "json": {
      "someFiled":"someValue"
    }
  }
```

-   Use 'form' as an object to POST data as url encoded form (content-type:application/x-www-form-urlencoded):

```json
  {
    "form": {
      "someFiled":"someValue"
    }
  }
```

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
    options: {
      url: 'http://myhost.com',
      agent: createHttpForeverAgent({
        cert:'myCert',
        ket:'myKet',
        proxy: '192.120.3.4:80'
      })
    }
  }
  ]
}) 
```
- To disable the proxy even using proxy env variables just set agent null on the request you need it or create a new Agent without proxy
```js
// my-datasource.js
const { restDatasourceTemplate } =  require('@bautajs/datasource-rest');
module.exports = restDatasourceTemplate({
  "prividers": [
    {
      "id": "operation1",
      "options": {
        "url": "http://myhost.com",
        "agent": null
      }
    }
  ]
}) 
```
