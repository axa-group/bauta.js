# OpenAPI Validation

If an openAPI definition is not provided on the Bauta.js instance initizalition, the request and response validations are not usable.

## Request validation

Bauta.js comes with a default request validation using the [openAPI schema v2 or v3](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#specification). **This validation is enabled by default**.

You can disable it for every operation using `operations.operation1.validateRequest(false);` inside the resolver where you are defining the logic of the operation.

It's recommended to have an error handler since this will throw a [AJV error](https://www.npmjs.com/package/ajv#validation-errors). The HTTP status code of the error thrown will be a 400 code.

The request validation can be globally disabled on all the operations settting on the `Bauta.js` initialization enabledRequestValidation as false.

```js
 const { BautaJS } = require('@axa-group/bautajs-core');
 const apiDefinition = require('./my-api-definitions');

 const bautajs = new BautaJS({ apiDefinition, enableRequestValidation: false });
```

Alternative you can also validate programmaticaly in any step function by accessing to the context `ctx.validateRequestSchema()`.

```js
  const { getRequest } = require('@axa-group/bautajs-express');

  operations.findCats.setup((_, ctx) => {
    ctx.validateRequestSchema(getRequest(ctx));
    // if the request is not valid this will throw an [AJV](https://www.npmjs.com/package/ajv#validation-errors) error
  });
```

## Response Validation

Bauta.js comes with a default response validation using the [openAPI schema v2 or v3][15]. It is disabled by default.

You can enable it for every operation using `operations.operation1.validateResponse(true);` inside the resolver where you are defining the logic of the operation.

It's recommended to have an error handler since this will throw a [AJV error](https://www.npmjs.com/package/ajv#validation-errors). The HTTP status code of the error thrown will be a 500 code.

The response validation can be globally enabled on all the operations settting on the `Bauta.js` initialization enabledResponseValidation as true.

```js
 const { BautaJS } = require('@axa-group/bautajs-core');
 const apiDefinition = require('./my-api-definitions');

 const bautajs = new BautaJS({ apiDefinition, enableResponseValidation: true });
```

Alternative you can also validate programmaticaly in any step function by accessing to the context `ctx.validateResponseSchema(response, status=200)`.

```js
  operations.findCats.setup((_, ctx) => {
      const myResponse = {foo: 'bar'};

      ctx.validateResponseSchema(myResponse);
      // if the request is not valid this will throw an [AJV](https://www.npmjs.com/package/ajv#validation-errors) error

  });
```

Additionally, it allow to specify againts what HTTPS response status code you want to validate to.

```js
  operations.findCats.setup((_, ctx) => {
    const myResponse = {foo: 'bar'};
    const res = getResponse(ctx);
    res.status(201);

    ctx.validateResponseSchema(myResponse, 201);
    // if the request is not valid and/or the response status code is not 201 this will throw an [AJV](https://www.npmjs.com/package/ajv#validation-errors) error

  });
```

### Response validation flow

#### HTTP status code 2xx

Bauta.js look into the operation schema definition for the response content defined for that statusCode to validate the response. Bauta.js only validates responses content `application/json`. The determination of the schema againts which Bauta.js have to validate the response follow the next order:

1. `responses[statusCode]`.
2. ```responses.default```.
3. ```responses['200']```.
4. If none of the above rules are satisfied, the validation is not executed.

#### HTTP status code 4xx and 5xx

Bauta.js look into the operation schema definition for the response error content defined for that statusCode to validate the response. Bauta.js only validates responses content `application/json`. The determination of the schema againts which Bauta.js have to validate the response follow the next order:

1. `responses[statusCode]`.
2. ```responses.default```.
3. If none of the above rules are satisfied, the validation is not executed.

In any case, to validate an error response that do not consist only on a message, the error has to have the method `toJSON` defined to return the error as a plain javascript object.

## Custom format validation

If the default format validation is not enough, you can extend it by setting on the Bauta.js instance initialization the parameter `customFormatsValidation`. It is an array of objects with the following format:

- `name`: The format string that will be checked against the swagger format value. (ex.: `"ISO 3166-1 alpha-2"`)
- `type`: It's optional, and corresponds to an integer or string.
- `validator`: Either a string that corresponds to a regular expression or a function. If it is a function it must accept one value and then return a boolean indicating whether the given value passes or not the validation.

## Validation limitations

The validation for request and response body are always done againts the last content type defined on the operation's openapi schema.
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

In the previous example only the "application/json" schema will be pick for validation. In case that no content type is defined there won't be any validation over that object.

### Response validation error formatter

If you have enabled the response validation feature that Bauta.js provides, note that this always happens at the response final stage, where in case it was an error, will be after your defined a error handler (we recommend to have one!). Therefore, the error returned will follow the [error format that Bauta.js validator has implemented](../../packages/bautajs-core/src/core/validation-error.ts).

If you want to modify this format, you can define a handler to convert that error and pass it on the Bauta.js initialization parameter `onResponseValidationError`.

```js
    const bautajs = new BautaJSExpress({
      apiDefinition: apiDefinition,
      onResponseValidationError: err => ({
        message: err.message,
        code: 'Error code',
        customField: true
      })
    });
```
