## bautajs/core

A library to build easy versionable and self organized middlewares.


## How to install

Make sure that you have access to [Artifactory][14]

```console
  npm install @bautajs/core
```


## Usage

To use bautaJS with the default configuration we will need to create the following folder structure:

-   server
    -   services
        -   v1
            -   cats
                -   cats-datasource.json
                -   cats-resolver.js
    -   server.js
    -   api-definitions.json

// cats-datasource.json

```json
{
  "services": {
    "cats": {
      "operations": [
        {
          "name": "find",
          "url": "{{config.endpoint}}/getsome"
        }
      ]
    }
  }
}
```

// cats-resolver.js

```js
  const { compileDataSource } = require('@bautajs/decorators');
  const { resolver } = require('@bautajs/core');
  const catsSchema = require('./cats-schema.json');

  module.exports = resolver(services => {
    services.cats.v1.find
      .setup(p => 
        p.push(compileDataSource((_, ctx) => {
          ctx.logger.info('Fetching some cats');

          return ctx.dataSource.request();
        }))
      )
  });
```

// api-definitions.json

```json
  [
    {
      "openapi": "3.0",
      "apiVersion": "1.0",
      "swaggerVersion": "1.0",
      "info": {
        "description": "API for cool cats",
        "version": "v1",
        "title": "My API"
      },
      "servers": [{
        "url":"/v1/api/"
      }],
      "paths": {
        "/cats": {
          "get": {
            "tags": ["cats"],
            "summary": "Get the list of cats",
            "operationId": "find",
            "produces": ["application/json"],
            "responses": {
              "200": {
                "description": "successful operation",
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "Object",
                    "properties": {
                      "name": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            }
          }
        }
    }
  ]
```

// server.js

```js
    const BautaJS = require('@bautajs/core');
    const apiDefinitions = require('./api-definitions.json');

    const bautaJS = new BautaJS(apiDefinitions);

    await bautaJS.services.cats.v1.find.run({});
```

This will produce a request to `coolcats.com` with the result:

```json
  [
    {
      "name": "cat1"
    }
  ]
```


## Features

### Step and resolver

There is two features you can use to get intellicense on steps and resolvers on the resolvers and on the steps.

my-resolver.js
```js
  const { resolver } = require('@bautajs/core') // Alternative you can load the specific integration library require('@bautajs/express');

  module.exports = resolver((services) => {
    services.cats.v1.operation.find.run();
  })
```

my-step-helpers.js
```js
  const { step } = require('@bautajs/core') // Alternative you can load the specific integration library require('@bautajs/express');

  const stepHelper1 = step((value, ctx) => {
    ctx.data.something = 'something';
  })
```

### Request Validation

`bautajs` comes with a default request validation using the [openAPI schema][15]. **_BY DEFAULT IT'S SET TO TRUE_**.
This feature is always enabled while you have a valid openAPI schema inputs. You can disable it globally setting up `validateRequest: false` on your API swagger definition or disable it locally for every operation
using `services.myService.v1.operation1.validateRequest(false);`

**_It's recomended to have an error handler since this will throw a [AJV error][16], you are free to convert them to a 400 or 422 errors_**

### Example

  This is a open api schema:

```json
{
  {
    "openapi": "3.0.0",
    "info": {
      "version": "v1",
      "title": "Swagger Petstore",
      "license": {
        "name": "MIT"
      }
    },
    "servers": [
      {
        "url": "http://petstore.swagger.io/v1"
      }
    ],
    "validateRequest": true,
    "paths": {
      ...
    }
}
```

  Alternative you can also validate inside every resolver by accesing to the context `ctx.validateRequest()`.

```js
  services.cats.v1.find.setup(p => 
      p.push(function pFn(_, ctx) {
      ctx.validateRequest();
      // if the request is not valid this will throw an [AJV](https://www.npmjs.com/package/ajv#validation-errors) error
    })
  );
```


### Response Validation

`bautajs` comes with a default response validation using the [openAPI schema][15]. **_BY DEFAULT IT'S SET TO TRUE_**.
This feature is always enabled while you have a valid openAPI schema response schema. You can disable it globally setting up `validateResponse: false` on your API swagger definition or disable it locally for every operation
using `services.myService.v1.operation1.validateResponse(false);`

**_It's recomended to have an error handler since this will throw a [ValidationError][17], you are free to convert them to a 400 or 422 errors_**

### Example

  This is a open api schema:

```json
{
  {
    "openapi": "3.0.0",
    "info": {
      "version": "v1",
      "title": "Swagger Petstore",
      "license": {
        "name": "MIT"
      }
    },
    "servers": [
      {
        "url": "http://petstore.swagger.io/v1"
      }
    ],
    "validateResponse": true,
    "paths": {
      ...
    }
}
```

  Alternative you can also validate inside every resolver by accesing to the context `ctx.validateResponse()`.

```js
  services.cats.v1.find.setup(p => 
    p.push(function pFn(response, ctx) {
      ctx.validateResponse(response);
      // if the response is not valid this will throw an ValidationError error 
    })
  );
```

  Alternative you can also set what is the valid response status that you want to validate to.

```js
  services.cats.v1.find.setup(p => 
    p.push(function pFn(response, ctx) {
      ctx.validateResponse(response, 201);
    })
  );
```


### datasources

The datasources are the main feature of the library. The dataSources define how the services will behave and from where the data will come.

### Define a datasource

To define a datasource, create a file into `"services/"` folder with a name ending on `"-datasource.json|js"`. The datasources are loaded automatically by the `bautajs` in bootstrap time.
A datasource containing a `url` property on its definition, represents a HTTP request (using [Got][18]).           

`By default request are done using [keepAlive](https://nodejs.org/api/http.html#http_new_agent_options)`

Without `url`, a datasource just describe an simple service operation.

### Datasource structure

`bautajs` datasources must be compliant with [./lib/validators/datasource-schema.json][19].

### Example

This is a datasource example:

```json
{
  "services": {
    "testService":{
      "operations":[
        {
          "name":"test",
          "url":"http://myserver.com",
          "options":{
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

Datasources used in every request are compiled on demand. It allow to add dynamic information into them, specifying properties from `req`, `config` and `env` (environment variables) objects. 
See the template syntax format at [stjs][20].
to retrieve dynamic data.

```json
{
  "services": {
    "testService":{
      "operations":[
        {
          "name":"test",
          "url":"{{config.url}}",
          "options":{
            "json": true,
            "headers": {
              "Accept-Language": [{
                "{{#if !req.headers.accept-language}}": "my default lang",
                "{{#else}}":"{{req.headers.accept-language}}"
              }]",
              "x-axa-user-agent": "{{req.headers.x-axa-user-agent}}"
            }
          }
        }
      ]
    }
  }
}
```

`Once the dynamic data is resolved, the fields with`undefined`or`null\` values, are removed from the request as [got definitions][18].

### Accessing compiled datasources from my resolvers (steps)

Is possible to access to compiled datasources from the operations resolvers.

```js
  const { compileDataSource } = require('@bautajs/decorators');

  // Launching the operation datasource request.
  services.cats.v1.find.setup(p => p.push(compileDataSource((_, ctx) => {
    return ctx.dataSource.request();
  })));
  // Launching the operation datasource request with custom option.
  // They will be merged with the definition options.
  services.cats.v1.find.setup(p => p.push(compileDataSource((_, ctx) => {
    const customOptions = { json: false };
    return ctx.dataSource.request(customOptions);
  })));
```

```js
  // Launching other operation datasource request
  services.cats.v1.find.setup(p => p.push((value, ctx) => {
    return services.documents.v1.find.dataSource(value, ctx).request();
  }));
```

By default, `bautajs`, uses [got][18] library to launch the operation datasources requests.
However, is possible to use your preferred request module using the datasources definitions.

```js
  const { compileDataSource, asCallback } = require('@bautajs/decorators');
  const request = require('request');

  services.cats.v1.find.setup(p =>
    p.push(compileDataSource(asCallback((_, ctx, cb) =>{
      const { method, url, options } = ctx.dataSource;

      return request({ method, url, ...options }, cb);
    })
  )));
```


### multipart/related requests

[got][18] do not come with `multipart/related` out of the box.
Thus, `bautajs` add it to be available at the operations datasources requests.
`bautajs` follows the way [request/request][21] implements `multipart/related` by using [multipart-request-builder][22].

```text
  Do not add the multipart configuration in the operation datasource definition if it has streams (fs.createReadStream).
  It must be passed in the resolver definition
```

```json
// my-datasource.json
// multipart/related without streams
{
  "testService": {
    "operations":  [
      {
        "name": "operation1",
        "headers": {
          "content-type": "multipart/related"
        },
        "preambleCRLF": true,
        "postambleCRLF": true
      }
    ]
  }
} 
```

```js
const compileDataSource = require('bautajs/decorators/compile-datasource');
// my-resolver.js
// multipart/related with stream
services.testService.v1.operation1.setup(p => p.push(compileDataSource((_, ctx) =>{
  return ctx.dataSource.request({
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
    // alternatively pass an object containing additional options multipart: {
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
  }})
})))
```


### multipart/form-data requests

As for `multipart/related`, `bautajs` provides its own implementation for `multipart/form-data`.

```text
  Do not add the multipart configuration in the operation datasource definition if it has streams (fs.createReadStream).
  It must be passed in the resolver definition
```

```json
// my-datasource.json
// multipart/related without streams
{
  "services": {
    "testService": {
      "operations": [
        {
          "name": "operation1"
        }
      ]
    }
  }
} 
```

```js
// my-resolver.js
// multipart/related with streams
services.testService.v1.operation1.setup(p => p.push(compileDataSource((_, ctx) => {
  const formData = {
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
  };
  return ctx.dataSource.request({ formData });
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

-   Custom `Agent` allowing the following features:
    -   http_proxy and https_proxy environment variables
    -   Request using custom certificates throught 'cert' and 'key' native NODEJS fields
    -   StricSSL enable throught 'rejectUnauthorized' field


### Debug

One of the main purpose of `bautajs` is provide a nice debugging experience. 
The request options, the response body and the times a request takes are logged.
To activate the logs just set debug:

```cmd
LOG_LEVEL=debug DEBUG=bautajs*
```

Furthemore, if you want to censor some words we strongly recomend use [pino redaction][23]


### API versioning

The `bautajs` has API versioning out of the box to version the services and datasources easily.

### API definition

The API definition is where are defined API versions, see [https://swagger.io/docs/specification/about/][24]

### Example

This is an example of API definitions for two API versions:

```json
// api-definitions.json
[
  {
    "openapi": "3.0.0",
    "apiVersion": "1.0",
    "info": {
      "description": "A new API",
      "version": "v1",
      "title": "CORE API"
    },
    "servers": [
      {
        "url":"/v1/api/"
     }
    ]
  },
  {
    "openapi": "3.0.0",
    "apiVersion": "2.0",
    "info": {
      "description": "A new API",
      "version": "v2",
      "title": "CORE API"
    },
    "servers": [
      {
        "url":"/v1/api/"
     }
    ]
  }
]
```

API versions are accesible by code too:

```js
// my-resolver.js
module.exports = (services) => {
  services.cats.v1.find.run();
  services.cats.v2.find.run();
}
```

In this example the `cats.v2` is inheriting automatically the behaviour of `cats.v1`

### Example of no inheritance

This is an example of API definitions for two API versions without inheritance:

-   Using the previous example api-definitions.json, we can specify on the v2 data source what we don't want to inherit:

```json
// v2-datasource.json
{
  "services": {
    "cats": {
      "operations": [
        {
          "id":"find",
          "inherit": false
        }
      ]
    }
  }
}
```

Then the two versions will have a different behaviour:

```js
// my-resolver.js
module.exports = (services) => {
  services.cats.v1.find.run();
  services.cats.v2.find.run(); // The result of this will be different from the v1
}
```

### Example of different datasources by version

This is an example of API definitions for two API versions without inheritance:

This will be the datasource for the different versions:

```json
{
  "services": {
    "cats":{
      "operations":[
        {
          "name":"find",
          "url":"http://google.es"
        },
        {
          "name":"find",
          "url":"http://facebook.es",
          "version":"v2"
        }
      ]
    }
  }
}
```

So as you can see here the v1 `cats.find` will fetch the data from google.es and v2 will fetch data from facebook.com.
Datasources without `version` will be linked to the first api-definition version. Also, `version` must match with the API definition `info.version`.


### Using lodash FP functions

Lodash FP functions can be pushed to the execution chain.

```js
// my-resolver.js
const flow = require('lodash/fp/flow');
const map = require('lodash/fp/map');
const filter = require('lodash/fp/filter');
const { request, asValue } = require('@bautajs/decorators');

module.export = (services) => {
  services.test.v1.op1
  .setup(p => 
    p.push(request({ resolveBodyOnly: true }))
    p.push(asValue(flow(
        map(['id':'myIdMapped']),
        filter(['tag','dogs'])
      )
    ))
  );
  // Use it without flow (not recomended sice push will create a promise always)
  services.test.v1.op1
   .setup(p => 
      p.push(request({ resolveBodyOnly: true }))
      p.push(asValue(map(['id':'myIdMapped'])))
      p.push(asValue(filter(['tag','dogs'])))
    );
}
```


[1]: #bautajs

[2]: #how-to-install

[3]: #usage

[4]: #features

[5]: #request-validation

[6]: #response-validation

[7]: #datasources

[8]: #multipartrelated-requests

[9]: #multipartform-data-requests

[10]: #request-like-features

[11]: #debug

[12]: #api-versioning

[13]: #using-lodash-fp-functions

[14]: https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/

[15]: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#specification

[16]: https://www.npmjs.com/package/ajv#validation-errors

[17]: ValidationError

[18]: https://github.com/sindresorhus/got

[19]: ./lib/validators/datasource-schema.json

[20]: https://www.npmjs.com/package/stjs

[21]: https://github.com/request/request#multipartrelated

[22]: https://github.axa.com/Digital/bauta-nodejs/tree/master/packages/multipart-request-builder

[23]: https://github.com/pinojs/pino/blob/master/docs/redaction.md

[24]: https://swagger.io/docs/specification/about/
