# OpenAPI Validation

If an openAPI definition is not provided on the Bauta.js instance initizalition, the request and response validations are not usable.

> ℹ️ This validation only refers to `bautajs-core` validation. If you are using `bautajs-fastify` or `bautajs-express` check the validation section of every package. See [bautajs-fastify validation](https://github.com/axa-group/bauta.js/tree/main/packages/bautajs-fastify#validation) and [bautajs-express validation](https://github.com/axa-group/bauta.js/tree/main/packages/bautajs-express#validation) for further details.

## Request validation

Bauta.js comes with a default request validation using the [openAPI schema v2 or v3](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#specification). **This validation is enabled by default**.

You can disable it for every operation using `operations.operation1.validateRequest(false);` inside the resolver where you are defining the logic of the operation.

It's recommended to have an error handler since this will throw a [AJV error](https://www.npmjs.com/package/ajv#validation-errors). The HTTP status code of the error thrown will be a 400 code.

The request validation can be globally disabled on all the operations settting on the `Bauta.js` initialization enabledRequestValidation as false.

```js
 const { BautaJS } = require('@axa/bautajs-core');
 const apiDefinition = require('./my-api-definitions');

 const bautajs = new BautaJS({ apiDefinition, enableRequestValidation: false });
```

Alternative you can also validate programmaticaly in any step function by accessing to the context `ctx.validateRequestSchema()`.

```js
  const { getRequest } = require('@axa/bautajs-express');

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
 const { BautaJS } = require('@axa/bautajs-core');
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

### Request validation flow

Bauta.js delegates into the AJV validator the validation of the schemas. This may be done directly or through the server application. Thus, the behaviour of the request schema validation depends on the AJV options that are exposed to Bauta.js constructor through the `validatorOptions` field.

You may check details about this options [in the AJV documentation page](https://ajv.js.org/options.html#options-to-modify-validated-data). 

If you have reached this page because you are having troubling during the schema validation phase, it may be interesting checking this [troubleshooting guide during schema validation](./guides/troubleshooting-schema-validation-issues.md)

#### Side note about request parsing

While this section involves request validation, it is important to note that before validation, the request has to be parsed. This applies to entire bodies in a PUT/POST request or the url's parameters in any request.

Bauta.js does not parse anything because this is delegated to the server instance used by Bauta.js (currently Express or Fastify). This means that to adapt the request parsing to your needs you will have to check the Server documentation to check how you can do it so.

An archetypical example would be query strings as array using comma separated values. This is not supported out of the box by the query parser used by node and thus, you would need to make modifications to the server instance used by Bauta.js before initializing the Bauta.js instance.

The conclusion of this section is that if you have issues when parsing the request, you will have to check the documentation of the Server instance to see how you can add a custom query parser that meets your needs.

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
