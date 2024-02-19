# Troubleshooting schema validation issues

Note: If you just want an overall vision of how the schema validation works in Bauta.js is best to start in the [validation](../validation.md) section.

This section covers a very specific topic, but that may become complex and tricky to troubleshoot: What happens if you are having an unexpected error during the schema validation phase.

## Conditions

This issue may happen after the following conditions meet:

- You have a valid schema swagger with the endpoint you are having issues with correctly defined.
- Bauta.js starts as expected and publishes accordingly the endpoint you are having issues with.
- For any reason the schema does not conform to your expectations: This may mean that you are getting an schema error validation when you would expect the request to be valid or the opposite.
- While this may happen for request or responses, we assume for the sake of the explanation that it happens for a request.

## Context for troubleshooting possible issues

You have to understand how the different components that allow for the schema validator work.

1. Bauta.js does not validate anything directly.
2. Instead, it delegates the validation to [the AJV library](https://ajv.js.org/guide/getting-started.html).
3. The validation is done in the request lifecycle that is a responsability of the server implementaiton used.
4. The AJV validator is created by default with an specific set of values that may not feed your needs, especially if you are having unexpected issues.

The default values for creating the AJV validator are the following:

```js
{
  logger: false,
  strict: false,
  coerceTypes: false,
  useDefaults: true,
  removeAdditional: true,
  allErrors: true
}
```

## Troubleshooting issues

If you are having unexpected validation issues the first culprit could be because one of the previous default options are not good for your use case. In that case you should check the information for those flags and make sure you overwrite them in the `validatorOptions` field exposed by Bauta.js. 

However, these fields belong to the AJV schema validator initialization and Bauta.js passes them to it. The information for these fields is in the [relevant documentation of AJV](https://ajv.js.org/options.html#options-to-modify-validated-data).


## GET endpoint with an array query param

Let's assume that you want to implement an enpoint which is a GET that uses a query string param that may have N values that are mapped to an array. 

This example is implemented for Fastify in the example project `bautajs-fastify-example`, using the operationId `multiplePathSpecific`.

With the default instance of AJV validator in bauta.js you will be able to call this endpoint with url's like this: 

`http://localhost:3000/api/array-query-param?chickenIds=jack&chickenIds=peter`

But if you do a request with a single parameter: 

`http://localhost:3000/api/array-query-param?chickenIds=jack`

You will get an unexpected result, because instead of a valid response you get an error:

```js
{
    "error": {
        "code": "BadArgument",
        "message": "The request was not valid",
        "details": [
            {
                "target": "querystring.properties.subscriptionIds.type",
                "message": "must be array",
                "code": "type"
            }
        ]
    }
}
```

### What is happening and how to solve it? 

1. Following the instructions of this chapter, we decide to check the options of AJV constructor.

2. After an analysis of those options and its related documentation, and we discover that the option `coerceTypes`, set to **false** by default in Bauta.js *does not support arrays*. 

3. We overwrite the value of this field passing to the Bauta.js constructor the following extra options:

```js
validatorOptions: {
  coerceTypes: 'array'
}
```

4. Now, this solves the issue, so now, if you make the request 

`http://localhost:3000/api/array-query-param?chickenIds=jack`

you will get the expected result instead of an unexpected schema validation error.

5. But with this option, AJV does not validate the inputs as string anymore, but coerces them into an array. This is relevant because now, this request (assuming that the field `chickenIds` is mandatory):

`http://localhost:3000/api/array-query-param?chickenIds=`

will not fail with an expected error but instead will continue with an array containing `["undefined"]`. 


This is a simple use case to show you the issues that you can have the moment that your requirements do not meet the default options used by Bauta.js and AJV.


