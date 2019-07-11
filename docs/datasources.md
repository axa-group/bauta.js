### Datasource

The datasources are the main feature of the library. The datasources define how the services will behave and from where the data will come.

### Define a datasource

To define a datasource, create a file into `"services/"` folder with a name ending on `"-datasource.json|js"`. The datasources are loaded automatically by the `bautajs` in bootstrap time.
If you will create a middleware we recomend to include the package `@bautajs/datasource-rest`, each operation of this datasource type will represents a HTTP request (using [Got][https://github.com/sindresorhus/got]).

Without `@bautajs/datasource-rest` and `url` parameter, a datasource just describe an simple service operation.

### Datasource structure

`bautajs` datasources must be compliant with the [DataSourceTemplate](./packages/bautajs/src/utils/types.ts)
`bautajs/datasource-rest` must be compliant with the [RestDataSourceTemplate](./packages/bautajs-datasource-rest/src/utils/types.ts)

### Example

This is a datasource example:

```js
const { restDataSource } = require('@bautajs/datasource-rest');

module.exports = restDataSource({
  "services": {
    "testService":{
      "operations":[
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
  }
}
```

### Dynamic datasources

Datasources used in every request are compiled on demand if is a js file. It allow to add dynamic information into them, specifying properties from `value`, `ctx`, `$static` and `$env` objects. 
 - `value`: reference to the previous step result.
 - `ctx`: reference to the current context, see (Context interface)[./src/utils/types.ts] Context.
 - `$static`: reference to the $static generic data coming from the `bautajs` constructor parameter dataSourceStaticCtx.
 - `$env`: reference to the current NodeJS process.env.

```js
const { restDataSource } = require('@bautajs/datasource-rest');

module.exports = restDataSource({
  services: {
    testService:{
      operations:[
        {
          id:"test",
          options(_, ctx, $static){
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
    }
  }
});
```

`Once the dynamic data is resolved, the fields with`undefined`or`null\` values, are removed from the request as [got definitions][https://github.com/sindresorhus/got].

Alternative you can also use a datasource template:

```js
const { restDataSourceTemplate } = require('@bautajs/datasource-rest');

module.exports = restDataSourceTemplate({
  services: {
    testService:{
      operations:[
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
    }
  }
});
```

### Accessing compiled datasources from my resolvers (steps)

Is possible to access to compiled datasources from the operations resolvers.

```js
  const { compileDataSource } = require('@bautajs/datasource-rest');

  // Launching the operation datasource request.
  services.cats.v1.find.setup(p => p.push(compileDataSource((_, ctx, dataSource) => {
    return dataSource.request();
  })));
  // Launching the operation datasource request with custom option.
  // They will be merged with the definition options.
  services.cats.v1.find.setup(p => p.push(compileDataSource((_, ctx, dataSource) => {
    const customOptions = { json: false };
    return dataSource.request(customOptions);
  })));
```

```js
  // Launching other operation datasource request
  services.cats.v1.find.setup(p => p.push((value, ctx, srv) => {
    return srv.documents.v1.find.dataSourceBuilder.bind(ctx)(value).request();
  }));
```

```js
  // Launching other operation
  services.cats.v1.find.setup(p => p.push((value, ctx, srv) => {
    return srv.documents.v1.find.run(ctx);
  }));
```

By default, `bautajs/datasource-rest`, uses [got][https://github.com/sindresorhus/got] library to launch the operation datasources requests.
However, is possible to use your preferred request module using the datasources definitions.

```js
  const { compileDataSource, asCallback } = require('@bautajs/datasource-rest');
  const request = require('request');

  services.cats.v1.find.setup(p =>
    p.push(compileDataSource(asCallback((_, ctx, dataSource, cb) =>{
      const { options } = dataSource.options;

      return request(options, cb);
    })
  )));
```

Alternative you can build your own datasource provider:

```js
const { dataSource } = require('@bautajs/core');
const request = require('request');

module.exports = dataSource({
  services: {
    testService:{
      operations:[
        {
          id:"test",
          runner: (prev, ctx) => {

            return new Promise ((resolve, reject) => request({ method: ctx.data.method, url:ctx.data.url }, (err, result) => err ? reject(err) : resolve(result)));
          }
        }
      ]
    }
  }
});
```

Even your own datasource connector.

```js
const request = require('request');

function restOperationTemplate(operationTemplate) {
  return {
    id: operationTemplate.id,
    version: operationTemplate.version,
    private: operationTemplate.private,
    inherit: operationTemplate.inherit,
    runner: (value, ctx, $env, $static) => {
      return new Promise((resolve, reject) =>
        request(operationTemplate.options(value, ctx, $env, $static), (err, result) => err ? reject(err) : resolve(result))
      );
    }
  };
}

function myDataSourceConnector(dsTemplate) {
  const result = { services: {} };

  Object.keys(dsTemplate.services).forEach(service => {
    result.services[service] = {
      operations: dsTemplate.services[service].operations.map(op =>
        restOperationTemplate(op, dsTemplate.services[service].options)
      )
    };
  });

  return result;
}
```

And then use it on all your datasources

```js 
  const { myDataSourceConnector } = require('./my-datasource-connector');

  module.exports = myDataSourceConnector({
    services:{
      cats: {
        operations:[
          {
            id:'1',
            options(_, ctx) {
              return {
                url: `http://${ctx.data.url}`
              }
            }
          }
        ]
      }
    }
  })

```

### multipart/related requests

[got][https://github.com/sindresorhus/got] do not come with `multipart/related` out of the box.
Thus, `bautajs` add it to be available at the operations datasources requests.
`bautajs` follows the way [request/request][https://github.com/request/request#multipartrelated] implements `multipart/related` by using [multipart-request-builder][../packages/multipart-request-builder].

```js
// my-datasource.js
const { dataSource } = require('@bautajs/express');
module.exports = dataSource({
  "testService": {
    "operations":  [
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
  }
})
```

```js
const compileDataSource = require('bautajs/decorators/compile-datasource');
// my-resolver.js
services.testService.v1.operation1.setup(p => p.push(compileDataSource((_, ctx) =>{
  return ctx.dataSource.request()
})))
```


### multipart/form-data requests

As for `multipart/related`, `bautajs` provides its own implementation for `multipart/form-data`.

```js
// my-datasource.json
// multipart/related without streams
const { restDataSourceTemplate } = require('@bautajs/datasource-rest');

module.exports = restDataSourceTemplate({
  "services": {
    "testService": {
      "operations": [
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
    }
  }
}) 
```

```js
// my-resolver.js
services.testService.v1.operation1.setup(p => p.push(compileDataSource((_, ctx) => {
  return ctx.dataSource.request();
})));
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
const { restDatasourceTemplate } =  require('@bautajs/datasource-rest');
module.exports = restDatasourceTemplate({
  "services": {
    "testService": {
      "operations": [
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
    }
  }
}) 
```
- To disable the proxy even using proxy env variables just set agent null on the request you need it or create a new Agent without proxy
```js
// my-datasource.js
const { restDatasourceTemplate } =  require('@bautajs/datasource-rest');
module.exports = restDatasourceTemplate({
  "services": {
    "testService": {
      "operations": [
        {
          "id": "operation1",
          "options": {
            "url": "http://myhost.com",
            "agent": null
          }
        }
      ]
    }
  }
}) 
```