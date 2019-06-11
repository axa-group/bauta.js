
bautajs/core
------------

A library to build easy versionable and self organized middlewares.

How to install
--------------

Make sure that you have access to [Artifactory](https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/)

```console
  npm install @bautajs/core
```

Usage
-----

To use bautaJS with the default configuration we will need to create the following folder structure:

*   server
    *   services
        *   v1
            *   cats
                *   cats-datasource.json
                *   cats-resolver.js
    *   server.js
    *   api-definitions.json

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

Features
--------

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

`bautajs` comes with a default request validation using the [openAPI schema](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#specification). **_BY DEFAULT IT'S SET TO TRUE_**. This feature is always enabled while you have a valid openAPI schema inputs. You can disable it globally setting up `validateRequest: false` on your API swagger definition or disable it locally for every operation using `services.myService.v1.operation1.validateRequest(false);`

**_It's recomended to have an error handler since this will throw a [AJV error](https://www.npmjs.com/package/ajv#validation-errors), you are free to convert them to a 400 or 422 errors_**

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

`bautajs` comes with a default response validation using the [openAPI schema](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#specification). **_BY DEFAULT IT'S SET TO TRUE_**. This feature is always enabled while you have a valid openAPI schema response schema. You can disable it globally setting up `validateResponse: false` on your API swagger definition or disable it locally for every operation using `services.myService.v1.operation1.validateResponse(false);`

**_It's recomended to have an error handler since this will throw a [ValidationError](ValidationError), you are free to convert them to a 400 or 422 errors_**

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

To define a datasource, create a file into `"services/"` folder with a name ending on `"-datasource.json\|js"`. The datasources are loaded automatically by the `bautajs` in bootstrap time. A datasource containing a `url` property on its definition, represents a HTTP request (using [Got](https://github.com/sindresorhus/got)).

`By default request are done using [keepAlive](https://nodejs.org/api/http.html#http_new_agent_options)`

Without `url`, a datasource just describe an simple service operation.

### Datasource structure

`bautajs` datasources must be compliant with [./lib/validators/datasource-schema.json](./lib/validators/datasource-schema.json).

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

Datasources used in every request are compiled on demand. It allow to add dynamic information into them, specifying properties from `req`, `config` and `env` (environment variables) objects. See the template syntax format at [stjs](https://www.npmjs.com/package/stjs). to retrieve dynamic data.

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

`Once the dynamic data is resolved, the fields with`undefined`or`null\` values, are removed from the request as [got definitions](https://github.com/sindresorhus/got).

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

By default, `bautajs`, uses [got](https://github.com/sindresorhus/got) library to launch the operation datasources requests. However, is possible to use your preferred request module using the datasources definitions.

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

[got](https://github.com/sindresorhus/got) do not come with `multipart/related` out of the box. Thus, `bautajs` add it to be available at the operations datasources requests. `bautajs` follows the way [request/request](https://github.com/request/request#multipartrelated) implements `multipart/related` by using [multipart-request-builder](https://github.axa.com/Digital/bauta-nodejs/tree/master/packages/multipart-request-builder).

```text
  Do not add the multipart configuration in the operation datasource definition if it has streams (fs.createReadStream).
  It must be passed in the resolver definition
```

```json
// my-datasource.json
// multipart/related without streams
{
  "testService": {
    "operations":  [
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

*   Use 'json' as an object to POST json data (content-type: application/json):

```json
  {
    "json": {
      "someFiled":"someValue"
    }
  }
```

*   Use 'form' as an object to POST data as url encoded form (content-type:application/x-www-form-urlencoded):

```json
  {
    "form": {
      "someFiled":"someValue"
    }
  }
```

*   Custom `Agent` allowing the following features:
    *   http\_proxy and https\_proxy environment variables
    *   Request using custom certificates throught 'cert' and 'key' native NODEJS fields
    *   StricSSL enable throught 'rejectUnauthorized' field

### Debug

One of the main purpose of `bautajs` is provide a nice debugging experience. The request options, the response body and the times a request takes are logged. To activate the logs just set debug:

```cmd
LOG_LEVEL=debug DEBUG=bautajs*
```

Furthemore, if you want to censor some words we strongly recomend use [pino redaction](https://github.com/pinojs/pino/blob/master/docs/redaction.md)

### API versioning

The `bautajs` has API versioning out of the box to version the services and datasources easily.

### API definition

The API definition is where are defined API versions, see [https://swagger.io/docs/specification/about/](https://swagger.io/docs/specification/about/)

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

*   Using the previous example api-definitions.json, we can specify on the v2 data source what we don't want to inherit:

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

So as you can see here the v1 `cats.find` will fetch the data from google.es and v2 will fetch data from facebook.com. Datasources without `version` will be linked to the first api-definition version. Also, `version` must match with the API definition `info.version`.

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

## Index

### Enumerations

* [EventTypes](enums/eventtypes.md)
* [ResponseType](enums/responsetype.md)

### Classes

* [Accesor](classes/accesor.md)
* [BautaJS](classes/bautajs.md)
* [LoggerBuilder](classes/loggerbuilder.md)
* [OperationBuilder](classes/operationbuilder.md)
* [PipelineBuilder](classes/pipelinebuilder.md)
* [ServiceBuilder](classes/servicebuilder.md)
* [ValidationError](classes/validationerror.md)

### Interfaces

* [BautaJSBuilder](interfaces/bautajsbuilder.md)
* [BautaJSOptions](interfaces/bautajsoptions.md)
* [CompiledContext](interfaces/compiledcontext.md)
* [Context](interfaces/context.md)
* [ContextData](interfaces/contextdata.md)
* [DataSourceData](interfaces/datasourcedata.md)
* [DataSourceTemplate](interfaces/datasourcetemplate.md)
* [Dictionary](interfaces/dictionary.md)
* [FullResponseRequestOptions](interfaces/fullresponserequestoptions.md)
* [HandlerAccesor](interfaces/handleraccesor.md)
* [ICallback](interfaces/icallback.md)
* [IValidationError](interfaces/ivalidationerror.md)
* [LocationError](interfaces/locationerror.md)
* [Logger](interfaces/logger.md)
* [Metadata](interfaces/metadata.md)
* [NormalizedOptions](interfaces/normalizedoptions.md)
* [OpenAPIV2Document](interfaces/openapiv2document.md)
* [OpenAPIV3Document](interfaces/openapiv3document.md)
* [Operation](interfaces/operation.md)
* [OperationDataSource](interfaces/operationdatasource.md)
* [OperationTemplate](interfaces/operationtemplate.md)
* [Pipeline](interfaces/pipeline.md)
* [RequestFn](interfaces/requestfn.md)
* [RequestOptions](interfaces/requestoptions.md)
* [ServiceTemplate](interfaces/servicetemplate.md)
* [Session](interfaces/session.md)
* [StreamRequestOptions](interfaces/streamrequestoptions.md)
* [ValidationErrorJSON](interfaces/validationerrorjson.md)

### Type aliases

* [Document](#document)
* [ErrorHandler](#errorhandler)
* [Omit](#omit)
* [OperationDataSourceBuilder](#operationdatasourcebuilder)
* [PathItemObject](#pathitemobject)
* [PathsObject](#pathsobject)
* [Resolver](#resolver)
* [Service](#service)
* [Services](#services)
* [StepFn](#stepfn)
* [ValidationReqBuilder](#validationreqbuilder)
* [ValidationResBuilder](#validationresbuilder)
* [Version](#version)

### Variables

* [logger](#logger)

### Functions

* [buildDataSource](#builddatasource)
* [dataSource](#datasource)
* [defaultResolver](#defaultresolver)
* [getStrictDefinition](#getstrictdefinition)
* [isMergeableObject](#ismergeableobject)
* [pipeline](#pipeline)
* [prepareToLog](#preparetolog)
* [resolver](#resolver)
* [step](#step)

---

## Type aliases

<a id="document"></a>

###  Document

**Ƭ Document**: *[OpenAPIV2Document](interfaces/openapiv2document.md) \| [OpenAPIV3Document](interfaces/openapiv3document.md)*

*Defined in [utils/types.ts:73](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L73)*

___
<a id="errorhandler"></a>

###  ErrorHandler

**Ƭ ErrorHandler**: *`function`*

*Defined in [utils/types.ts:121](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L121)*

#### Type declaration
▸(err: *`Error`*, ctx: *[Context](interfaces/context.md)<`TReq`, `TRes`>*): `any`

**Parameters:**

| Name | Type |
| ------ | ------ |
| err | `Error` |
| ctx | [Context](interfaces/context.md)<`TReq`, `TRes`> |

**Returns:** `any`

___
<a id="omit"></a>

###  Omit

**Ƭ Omit**: *`Pick`<`T`, `Exclude`<`keyof T`, `K`>>*

*Defined in [utils/types.ts:24](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L24)*

___
<a id="operationdatasourcebuilder"></a>

###  OperationDataSourceBuilder

**Ƭ OperationDataSourceBuilder**: *`object` & `function`*

*Defined in [utils/types.ts:160](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L160)*

___
<a id="pathitemobject"></a>

###  PathItemObject

**Ƭ PathItemObject**: *`PathItemObject` \| `PathItemObject`*

*Defined in [utils/types.ts:75](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L75)*

___
<a id="pathsobject"></a>

###  PathsObject

**Ƭ PathsObject**: *`PathsObject` \| `PathObject`*

*Defined in [utils/types.ts:74](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L74)*

___
<a id="resolver"></a>

###  Resolver

**Ƭ Resolver**: *`function`*

*Defined in [utils/types.ts:115](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L115)*

#### Type declaration
▸(services: *[Services](#services)<`TReq`, `TRes`>*, utils: *`any`*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| services | [Services](#services)<`TReq`, `TRes`> |
| utils | `any` |

**Returns:** `void`

___
<a id="service"></a>

###  Service

**Ƭ Service**: *[Dictionary](interfaces/dictionary.md)<[Version](#version)<`TReq`, `TRes`>>*

*Defined in [utils/types.ts:110](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L110)*

___
<a id="services"></a>

###  Services

**Ƭ Services**: *[Dictionary](interfaces/dictionary.md)<[Service](#service)<`TReq`, `TRes`>>*

*Defined in [utils/types.ts:109](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L109)*

___
<a id="stepfn"></a>

###  StepFn

**Ƭ StepFn**: *`function`*

*Defined in [utils/types.ts:201](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L201)*

#### Type declaration
▸(prev: *`TIn`*, ctx: *[Context](interfaces/context.md)<`TReq`, `TRes`>*): `TOut` \| `Promise`<`TOut`>

**Parameters:**

| Name | Type |
| ------ | ------ |
| prev | `TIn` |
| ctx | [Context](interfaces/context.md)<`TReq`, `TRes`> |

**Returns:** `TOut` \| `Promise`<`TOut`>

___
<a id="validationreqbuilder"></a>

###  ValidationReqBuilder

**Ƭ ValidationReqBuilder**: *`function`*

*Defined in [utils/types.ts:136](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L136)*

#### Type declaration
▸(req?: *[TReq]()*): `null`

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` req | [TReq]() |

**Returns:** `null`

___
<a id="validationresbuilder"></a>

###  ValidationResBuilder

**Ƭ ValidationResBuilder**: *`function`*

*Defined in [utils/types.ts:137](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L137)*

#### Type declaration
▸(res: *`TRes`*, statusCode?: *`undefined` \| `number`*): `null`

**Parameters:**

| Name | Type |
| ------ | ------ |
| res | `TRes` |
| `Optional` statusCode | `undefined` \| `number` |

**Returns:** `null`

___
<a id="version"></a>

###  Version

**Ƭ Version**: *[Dictionary](interfaces/dictionary.md)<[Operation](interfaces/operation.md)<`TReq`, `TRes`>>*

*Defined in [utils/types.ts:118](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/types.ts#L118)*

___

## Variables

<a id="logger"></a>

### `<Const>` logger

**● logger**: *[LoggerBuilder](classes/loggerbuilder.md)* =  new LoggerBuilder(moduleName)

*Defined in [logger.ts:52](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/logger.ts#L52)*

___

## Functions

<a id="builddatasource"></a>

###  buildDataSource

▸ **buildDataSource**<`TReq`,`TRes`>(operationTemplate: *[OperationTemplate](interfaces/operationtemplate.md)*): [OperationDataSourceBuilder](#operationdatasourcebuilder)

*Defined in [request/datasource.ts:281](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/request/datasource.ts#L281)*

**Type parameters:**

#### TReq 
#### TRes 
**Parameters:**

| Name | Type |
| ------ | ------ |
| operationTemplate | [OperationTemplate](interfaces/operationtemplate.md) |

**Returns:** [OperationDataSourceBuilder](#operationdatasourcebuilder)

___
<a id="datasource"></a>

###  dataSource

▸ **dataSource**(json: *[DataSourceTemplate](interfaces/datasourcetemplate.md)*): [DataSourceTemplate](interfaces/datasourcetemplate.md)

*Defined in [decorators/datasource.ts:17](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/decorators/datasource.ts#L17)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| json | [DataSourceTemplate](interfaces/datasourcetemplate.md) |

**Returns:** [DataSourceTemplate](interfaces/datasourcetemplate.md)

___
<a id="defaultresolver"></a>

###  defaultResolver

▸ **defaultResolver**<`TReq`,`TRes`>(value: *`any`*, ctx: *[Context](interfaces/context.md)<`TReq`, `TRes`>*): `any`

*Defined in [utils/default-resolver.ts:17](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/default-resolver.ts#L17)*

**Type parameters:**

#### TReq 
#### TRes 
**Parameters:**

| Name | Type |
| ------ | ------ |
| value | `any` |
| ctx | [Context](interfaces/context.md)<`TReq`, `TRes`> |

**Returns:** `any`

___
<a id="getstrictdefinition"></a>

###  getStrictDefinition

▸ **getStrictDefinition**<`T`>(definition: *`T`*): `T`

*Defined in [utils/strict-definitions.ts:90](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/strict-definitions.ts#L90)*

**Type parameters:**

#### T :  [Document](#document)
**Parameters:**

| Name | Type |
| ------ | ------ |
| definition | `T` |

**Returns:** `T`

___
<a id="ismergeableobject"></a>

###  isMergeableObject

▸ **isMergeableObject**(item: *`any`*): `boolean`

*Defined in [utils/is-mergeable-datasource.ts:17](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/is-mergeable-datasource.ts#L17)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| item | `any` |

**Returns:** `boolean`

___
<a id="pipeline"></a>

###  pipeline

▸ **pipeline**<`TReq`,`TRes`,`TIn`>(fn: *`function`*): `function`

*Defined in [decorators/pipeline.ts:26](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/decorators/pipeline.ts#L26)*

A decorator to allow intellisense on pipeline on non typescript files

*__export__*: 

*__template__*: TReq

*__template__*: TRes

*__template__*: TIn

**Type parameters:**

#### TReq 
#### TRes 
#### TIn 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| fn | `function` |  \- |

**Returns:** `function`

___
<a id="preparetolog"></a>

###  prepareToLog

▸ **prepareToLog**(object: *`any`*): `string`

*Defined in [utils/prepare-to-log.ts:24](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/utils/prepare-to-log.ts#L24)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| object | `any` |

**Returns:** `string`

___
<a id="resolver"></a>

###  resolver

▸ **resolver**<`TReq`,`TRes`>(fn: *[Resolver](#resolver)<`TReq`, `TRes`>*): `function`

*Defined in [decorators/resolver.ts:17](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/decorators/resolver.ts#L17)*

**Type parameters:**

#### TReq 
#### TRes 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fn | [Resolver](#resolver)<`TReq`, `TRes`> |

**Returns:** `function`

___
<a id="step"></a>

###  step

▸ **step**<`TReq`,`TRes`,`TIn`,`TOut`>(fn: *[StepFn](#stepfn)<`TReq`, `TRes`, `TIn`, `TOut`>*): `function`

*Defined in [decorators/step.ts:17](https://github.axa.com/Digital/bauta-nodejs/blob/9b864df/packages/bautajs/src/decorators/step.ts#L17)*

**Type parameters:**

#### TReq 
#### TRes 
#### TIn 
#### TOut 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fn | [StepFn](#stepfn)<`TReq`, `TRes`, `TIn`, `TOut`> |

**Returns:** `function`

___

