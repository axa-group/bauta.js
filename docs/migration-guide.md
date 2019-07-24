# Migration Guide from 1.x.x to 2.x.x

### Services and operations

 - DataSources where the ones in charge of defining the services structure. Now that datasources has been detached completely from the `bautajs` core, the operations structure are defined by the OpenAPI file. See [api definition](./api-definition.md).

  - before:
  ```js
    service.myService.version.operation
  ```
  - now:
  ```js
    operations.version.operation
  ```

### exec to run

  - before:
  ```js
    service.myService.version.operation.exec(req, res);
  ```
  - now:
  ```js
    const ctx = {req, res};
    operations.version.operation.run(ctx);
  ```

### operation.push

  - before:
  ```js
    service.myService.version.operation.push(() =>[{a:1}]);
  ```

     A value, a function and a callback function was accepted on push

  - now:
  ```js
    operations.version.operation.setup((p) => p.push(() => [{a:'1'}]));
  ```

     Now only a function (value,ctx) => any is accepted on push.

### version.push

  - before:
  ```js
    service.myService.version.push(() =>[{a:1}]);
  ```
  - now: Has been removed

### dataSource resolveBodyOnly and stream

  - before:
  datasource.js
  ```json
    {
      "services":{
        "myService": {
          "operations":[{
            "id":"operation",
            "resolveBodyOnly": true
          },{
            "id":"operation2",
            "stream": true
          }
          ]
        }
      }
    }
  ```
  - now:
  ```js
      const { myProvider } = require('./my-datasource');
      operations.version.operation.setup(
        (p) => p.push(myProvider.compile((value, ctx, bautajs, provider) => {
          return provider.request({ resolveBodyOnly: true});
        }))
      );
        service.myService.version.operation2.setup(
        (p) => p.push(myProvider.compile((value, ctx, bautajs, provider) => {
          return provider.request({ stream: true});
        }))
      );
  ```

  - fullResponseBody has been deleted from the datasource now only can be used on the .request. This allow better intellisense on the response.

### DataSource
  - Datasource has been complete detached from bautajs core.
  - Operations now has been renamed providers.
  - Datasources don't define the services(operations) structure, operations are now linked to the openAPI definition.
  - Use @bautajs/datasources-rest to have same behaviour as on `bautajs` v1.x.x
  - Agent options are not supported anymore, to add options create a new agent, see [datasources](./datasources.md)

  - before:
  datasource.json
  ```js
      service.myService.version.operation.setup(
        (p) => p.push((value, ctx) => {
          return ctx.dataSource(ctx).request();
        })
      );
  ```
  - now:
  ```js
      const { myProvider } = require('./my-datasource');
      service.myService.version.operation.setup(
        (p) => p.push(myProvider())
      );
  ```

### Decorators

  - before:
  ```js
      const asValue = require('bautajs/decorators/as-value');
      service.myService.version.operation.push(asValue(1));
  ```
  - now: 
    * Raw decorators has been moved to the core module (asCallback, asValue, parallel, pipeline, resolver, step).
    * asCallback was renamed to asPromise
    * Request related decorators has been moved to @bautajs/datasource-rest module (asCallback with proivider context).
    * Third party dependen decorators has been moved to a separated modules (template, filter, cache).
  ```js
      const { asValue } = require('@bautajs/core');
      operations.version.operation.setup(
        (p) => p.push(asValue(1))
      );
  ```

### loopback filters

  - before:
  datasource.json
  ```json
    {
      "services":{
        "myService": {
          "operations":[{
            "id":"operation",
            "applyLoopbackFilters": true
          }]
        }
      }
    }
  ```
  - now:
  ```js
    const { queryFilters } = require('@bautajs/decorator-filter');
    const ctx = {req, res};
    operations.version.operation.setup((p) => p.push(() => [{a:'1'}]).push(queryFilters()));
  ```