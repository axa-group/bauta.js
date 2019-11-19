# Request Validation

`bautajs` comes with a default request validation using the [openAPI schema v2 or v3](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#specification). **_BY DEFAULT IT'S SET TO TRUE_**.
This feature is always enabled while you have a valid openAPI schema inputs. 
You can disable it globally setting up `validateRequest: false` on your API schema definition or disable it locally for every operation
using `operations.v1.operation1.validateRequest(false);`

**_It's recomended to have an error handler since this will throw a [AJV error](https://www.npmjs.com/package/ajv#validation-errors), you are free to convert them to a 400 or 422 errors_**

### Example

  This is a open api schema:

```json
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
  operations.v1.findCats.setup(p => 
      p.pipe(function pFn(_, ctx) {
      ctx.validateRequest();
      // if the request is not valid this will throw an [AJV](https://www.npmjs.com/package/ajv#validation-errors) error
    })
  );
```


# Response Validation

`bautajs` comes with a default response validation using the [openAPI schema v2 or v3][15]. **_BY DEFAULT IT'S SET TO TRUE_**.
This feature is always enabled while you have a valid openAPI schema response schema. You can disable it globally setting up `validateResponse: false` on your API swagger definition or disable it locally for every operation
using `operations.v1.operation1.validateResponses(false);`
s
**_It's recomended to have an error handler since this will throw a [ValidationError](../packages/bautajs/src/core/validation-error.ts), you are free to convert them to a 400 or 422 errors_**

### Example

  This is a open api schema:

```json
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

  Alternative you can also validate inside every resolver by accesing to the context `ctx.validateResponseSchema()`.

```js
  operations.v1.findCats.setup(p => 
    p.pipe(function pFn(response, ctx) {
      ctx.validateResponseSchema(response);
      // if the response is not valid this will throw an ValidationError error 
    })
  );
```

  Alternative you can also set what is the valid response status that you want to validate to.

```js
  operations.v1.findCats.setup(p => 
    p.pipe(function pFn(response, ctx) {
      ctx.validateResponseSchema(response, 201);
    })
  );
```

## Response validation is dependant on the schema response definition and the statusCode
Reading [this](https://nodejs.org/es/docs/guides/anatomy-of-an-http-transaction/#http-status-code) may help you to understand this section.

At the moment of validation, we check the statusCode, that may be:
- set specifically by you using ```res.writeHead(statusCode, ...)``` or similars
- set by default as 200 if calling ```res.end()```
- special case: in special situations when bauta is used alone without a server library, statusCode could be undefined, and in this case bauta will use 200 anyways as default

After getting the right statusCode, bauta searches in the schema definition for the response content defined for that statusCode to decide if a validation must be used applying always the same logic: bauta only validates response content if it is json. We do it in the following order:
- If ```responses[statusCode]``` is defined, it is used and validation is done if the defined content is a json.
- If not, if ```responses.default``` is defined, that is used to determine the content, applying the same logic.
- If not, if ```responses['200']``` is defined, we use it and we do the validation if its content is a json as well.
- Finally, if no content response definition was defined for none of the previous cases, *no validation is done*.

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
          "description": "unexpected error",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Error"
              }
            }
          }
        }
      }
 ...     
```
- if you pipe a response stream file, which generates a 200 http status code, then there will be no validation.

- if instead you force a 201 http status code when piping a response stream file, the default definition will be used, and thus you may an error because the validation will expect a json.

