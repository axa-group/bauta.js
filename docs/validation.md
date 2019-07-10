# Request Validation

`bautajs` comes with a default request validation using the [openAPI schema][https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#specification]. **_BY DEFAULT IT'S SET TO TRUE_**.
This feature is always enabled while you have a valid openAPI schema inputs. 
You can disable it globally setting up `validateRequest: false` on your API schema definition or disable it locally for every operation
using `services.myService.v1.operation1.validateRequest(false);`

**_It's recomended to have an error handler since this will throw a [AJV error][https://www.npmjs.com/package/ajv#validation-errors], you are free to convert them to a 400 or 422 errors_**

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
  services.cats.v1.find.setup(p => 
      p.push(function pFn(_, ctx) {
      ctx.validateRequest();
      // if the request is not valid this will throw an [AJV](https://www.npmjs.com/package/ajv#validation-errors) error
    })
  );
```


# Response Validation

`bautajs` comes with a default response validation using the [openAPI schema][15]. **_BY DEFAULT IT'S SET TO TRUE_**.
This feature is always enabled while you have a valid openAPI schema response schema. You can disable it globally setting up `validateResponse: false` on your API swagger definition or disable it locally for every operation
using `services.myService.v1.operation1.validateResponse(false);`
s
**_It's recomended to have an error handler since this will throw a [ValidationError][../packages/bautajs/src/core/validation-error.ts], you are free to convert them to a 400 or 422 errors_**

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