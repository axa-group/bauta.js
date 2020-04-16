# Migration Guide from 2.x.x to 3.x.x


## Apply Middlewares

The apply middlewares step now is asynchronous since it returns a promise. 

Before this was enough because appyMiddleware was a synchronous step:

```js

bautaJS.applyMiddlewares({
  explorer: serverDef.showExplorer
    ? {
        enabled: true,
        options: { swaggerOptions: { supportedSubmitMethods: [] } }
      }
    : null,
  bodyParser: {
    enabled: false
  }
});

```

But now the await is required and the enclosing function requires async (well, you can manage it as a promise, of course, but this
is simpler):


```js

await bautaJS.applyMiddlewares({
  explorer: serverDef.showExplorer
    ? {
        enabled: true,
        options: { swaggerOptions: { supportedSubmitMethods: [] } }
      }
    : null,
  bodyParser: {
    enabled: false
  }
});

```

## Operations in datasources

This is one of the most important changes in this release because working with operations have been simplified significantly. 

First, the following ways of configuring operations have been removed:
- restDatasource
- restDatasourceTemplate
- restProviderTemplate

Second, the only method of configuring operations, which is restProvider, has changed to become simpler.

Thus, you will need to transform any datasource configured using the removed methods to the restProvider method.

Finally, if you have restProviders, you need to change to the new way. First let's compare the old way to the new way:

Old way
```js
const exampleRestProvider = restProvider(
  {
    options(prv, ctx, static) {
      return {
        url: `http://numbersapi.com/${ctx.req.params.number}/math`,
        json: false
      };
    }
  },
  (prv, ctx, static) => {
    return { json: true, headers: ctx.req.headers };
  }
);
```

New way
```js
const exampleRestProvider = restProvider((client, _prv, ctx) => {
  return client.get(`http://numbersapi.com/${ctx.req.params.number}/math`, {
    responseType: 'text',
    resolveBodyOnly: true,
    headers: ctx.req.headers
  });
});
```

For details about how to configure a rest provider, check the documentation in the section [Datasources](./datasources.md).

## Datasource-rest, changes in configuration due to got breaking changes

Internally BautaJS uses [GOT library](https://github.com/sindresorhus/got) to make its requests. Usually you configure the datasources
without needing to know how GOT internally works and using his options. 

But one of the breaking changes in the version 3.0 of Bauta involves the change of Got library from v9 to v10, and this has some breaking
changes that require a change in the configuration of the datasources. For specific details in the Got library check [here](https://github.com/sindresorhus/got/releases/tag/v10.0.0). 

Following a list of old bauta scenarios that will no longer work with the new version of bauta and/or got:

### Parsing in pipeline

This is a tricky one because it may affect not only the operation datasources but possible pipelines code as well. 

Basically in this scenario you had:
- a response from the provider that is a json 
- in your datasource you configure the response as json false (this cannot be done anymore, check next point)
- you explicitly parse the response to json in the pipeline

What has to be done:
- responseType option should be set to 'json'
- check next point to see what to do with json option 
- remove any explicit parsing in your pipeline: Not doing so will cause errors as it will try to parse the json twice.

Why?
In new got version, as responseType is set to 'json', the response is returned as an already parsed json.

### Usage of json option

In this scenario you had:
- json option configured in your datasource to let know bauta that the response was a json (or not)

What has to be done:
- json option must be sent only to the body of the request, not anymore of the response. An it must not be stringified but passed as a plain javascript object.
- use responseType to set the type of response according to got documentation.

Why?
json option before affected request and response and that was very confusing and they could even have boolean values that no longer are valid

### Defaults of responseType and resolveBodyOnly in bauta

The default for bauta provider for these two values are the following:
- responseType: 'json'
- resolveBodyOnly: true

The typical case is that you need to set responseType to a different value, (for example, 'text'). If you are in this scenario, you have to set responseType to the type of response that you need or the provider through Got will try to parse as json the response.

### Error management from provider

This is again a BREAKING CHANGE due to got and not bauta itself but nevertheless unless you make modifications, your error management layer may be affected. This is important because if you do not have coverage in your tests related to error management, you could have issues in your error management unnoticed.

This changes are explained in [this PR](https://github.com/sindresorhus/got/pull/773) and in the details of the [Got release v10.0.0](https://github.com/sindresorhus/got/releases/tag/v10.0.0), but the main impact is:

- error.body is now error.response.body
- error.statusCode is now error.response.statusCode

For example, this is an error handler for an onError pipeline error handler in a bauta v2 - got v9 version:

```js
const gotErrorHandler = (err, ctx) => {
  if (err.body) {
    // Got error
    const userMessage = `Error Response from ING message ${err.body}`;
    ctx.logger.error(userMessage);
    Object.assign(err, { errors: [{ message: userMessage }] });
    throw err;
  } else {
    // Not Got error - irrelevant
  }
};
```

In new bauta v3 - got v10 version, the previous handler has to be modified to the following:

```js
const gotErrorHandler = (err, ctx) => {
  if (err.response && err.response.body) {
    // Got error
    const userMessage = JSON.parse(err.response.body);
    ctx.logger.error(userMessage);
    Object.assign(err, { errors: [{ message: userMessage }] });
    throw err;
  } else {
    // Not Got error - irrelevant
  }
```
The same logic has to be applied to statusCode when if needed.

### Swagger validation

Swagger validation engine has changed, before [openapi-validator](github.com/kogosoftwarellc/open-api) was used, now the open api specification is parsed with [swagger-parser](https://github.com/APIDevTools/swagger-parser) and is validated with [ajv](https://ajv.js.org). Check that the provided openAPI schema is compatible with AJV validator.