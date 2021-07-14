# Request Validation

`bautajs` comes with a default request validation using the [openAPI schema v2 or v3](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#specification). **_BY DEFAULT IT'S SET TO TRUE_**.
This feature is always enabled while you have a valid openAPI schema inputs and getRequest is provided on `bautaJS` constructor (If you are using a plugin such [@bautajs/express](../packages/bautajs-express) or [@bautajs/fastify](../packages/bautajs-fastify) you don't have to worry about that it will be automatically provided.
You can disable it locally for every operation using `operations.operation1.validateRequest(false);`

**_It's recommended to have an error handler since this will throw a [AJV error](https://www.npmjs.com/package/ajv#validation-errors**

The request validation can be globally enabled by set it on the `bautajs` initialization:

```js
 const { BautaJS } = require('@bautajs/core');
 const apiDefinition = require('./my-api-definitions');

 const bautajs = new BautaJS({ apiDefinition, enableRequestValidation: true });
```

Alternative you can also validate inside every resolver by accessing to the context `ctx.validateRequestSchema()`.

```js
  const { getRequest } = require('@bautajs/express');

  operations.findCats.setup(p => 
      p.pipe(function pFn(_, ctx) {
      ctx.validateRequestSchema(getRequest(ctx));
      // if the request is not valid this will throw an [AJV](https://www.npmjs.com/package/ajv#validation-errors) error
    })
  );
```

# Response Validation

`bautajs` comes with a default response validation using the [openAPI schema v2 or v3][15]. **_BY DEFAULT IT'S SET TO FALSE_**.
This feature is always enabled while you have a valid openAPI schema response and getResponse is provided on `bautaJS` constructor (If you are using a plugin such [@bautajs/express](../packages/bautajs-express) or [@bautajs/fastify](../packages/bautajs-fastify) you don't have to worry about that it will be automatically provided.
using `operations.v1.operation1.validateResponse(true);`
s
**_It's recomended to have an error handler since this will throw a [ValidationError](../packages/bautajs/src/core/validation-error.ts), error status code thrown is a 400_**

The response validation can be globally enabled by set it on the `bautajs` initialization:

```js
 const { BautaJS } = require('@bautajs/core');
 const apiDefinition = require('./my-api-definitions');

 const bautajs = new BautaJS({ apiDefinition, enableResponseValidation: true });
```

Alternative you can also validate inside every resolver by accessing to the context `ctx.validateResponseSchema()`.

```js
  operations.findCats.setup(p => 
    p.pipe(function pFn(response, ctx) {
      ctx.validateResponseSchema(response);
      // if the response is not valid this will throw an ValidationError error 
    })
  );
```

Alternative you can also set what is the valid response status that you want to validate to.

```js
  operations.findCats.setup(p => 
    p.pipe(function pFn(response, ctx) {
      ctx.validateResponseSchema(response, 201);
    })
  );
```

## Response validation is dependant on the schema response definition and the statusCode
Knowledge of node's behavior around http status codes is required for understanding this section. Check [this](https://nodejs.org/es/docs/guides/anatomy-of-an-http-transaction/#http-status-code) in order to get a better understanding.

## Success response validation

At the moment of validation, the statusCode is checked that is:
- set specifically by you using ```res.writeHead(statusCode, ...)``` or similar
- set by default as 200 if calling ```res.end()```
- special case: in special situations when bauta is used alone without a framework (express, fastify...) library, statusCode could be undefined, and in this case bauta will use 200 anyways as default

After getting the right statusCode, bauta searches in the schema definition for the response content defined for that statusCode to decide if a validation must be used applying always the same logic: bauta only validates response content if it is json. It's done in the following order:
- If ```responses[statusCode]``` is defined, it is used and validation is done if the defined content is a json.
- If not, if ```responses.default``` is defined, that is used to determine the content, applying the same logic.
- If not, if ```responses['200']``` is defined, we use it and we do the validation if its content is a json as well.
- Finally, if no content response definition was defined for none of the previous cases, *no validation is done*.

## Error response validation

Error response validation follow the same rules as success response validation except for two different rules.

- Instead of fallback to 200 statusCode, errors will fallback to error.statusCode if res.statusCode is not set. In case that both are undefined no response validation will be done.
- Also to be a validated, an error has to have the method toJSON which will return the error as a plain javascript object.

For example, let's assume that we have the following responses definition:

```json
...
      "responses": {
        "200": {
          "description": "The requested file.",
          "content": {
            "application/octet-stream": {
              "schema": {
                "type": "string",
                "format": "binary"
              }
            }
          }
        },
        "default": {
          "description": "Some other request",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/SomeResponse"
              }
            }
          }
        }
      }
 ...     
```
- if you pipe a response stream file, which generates a 200 http status code, then there will be no validation.

- if instead you force a 201 http status code when piping a response stream file, the default definition will be used, and thus you may an error because the validation will expect a json.

### Response Error validation

Since it is not `bautaJS` responsibility to do the response serialization, no validation is being done by default. Also, error handler occurs outside `bautaJS` scope, as this can change the error format itself, the error response validation falls under the framework used.

## Custom format validation

If the default format validation is not enough, you can extend it by passing to the `bautajsoptions.customFormatsValidation` an array of objects with the following format:

- a name, which is the format string that will be checked against the swagger format value. (ex.: `"ISO 3166-1 alpha-2"`)
- a type, optional, that corresponds to an integer or string.
- a validator: either a string that corresponds to a regular expression or a function. If it is a function it must accept one value and then return a boolean indicating whether the given value passes or not the validation.

There is a way to put custom format validations. This is passed to bautajs options in customFormatsValidation, which is an array of objects. Each object must have:

- a name, which is the format string that will be checked against the swagger format value.
- a type, optional, that corresponds to integer or string.
- a validator: which must be an string corresponding to a regular expression or to a function. If it is a function it must accept one value and then return a boolean indicating whether the given value passes or not the validation

## In case an api definition is not provided

In the case an apiDefinition is not provided, request and response validations are disabled and can not be enabled.

```js
 const { BautaJS } = require('@bautajs/core');

 const bautajs = new BautaJS({ enableResponseValidation: true });
```

If an user try to call manually the validation for instance `ctx.validateResponseSchema()` nothing will be returned or thrown.

```js
  operations.findCats.setup(p => 
    p.pipe(function pFn(response, ctx) {
      ctx.validateResponseSchema(response);
      // This won't do nothing
    })
  );
```

## Validation limitations

Validation for request and response body for OPENAPI V3 are done always to the last content type defined on the openapi schema.
Ex: 

```json
{
  "requestBody": {
    "content":{
      "text/plain":{
        "schema": {
          "type":"string"
        }
      },
      "application/json":{
        "schema": {
          "type":"object"
        }
      }
    }
  }
}
```

In the previous example only the "application/json" schema will be pick for validation.
In case that no content type is defined there won't be any validation over that object.

This behaviour is done like that to align the validation across frameworks, for instance fastify, only allows one schema for the request and the response.