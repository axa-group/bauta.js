# Migration Guide from 1.x.x to 2.x.x

### exec to run

  - before:
  ```js
    service.myService.version.operation.exec(req, res);
  ```
  - now:
  ```js
    const ctx = {req, res};
    service.myService.version.operation.run(ctx);
  ```

### operation.push

  - before:
  ```js
    service.myService.version.operation.push(() =>[{a:1}]);
  ```

     A value, a function and a callback function was accepted on push

  - now:
  ```js
    service.myService.version.operation.setup((p) => p.push(() => [{a:'1'}]));
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
      service.myService.version.operation.setup(
        (p) => p.push((value, ctx) => {
          return ctx.dataSourceBuilder(value).request({ resolveBodyOnly: true});
        })
      );
        service.myService.version.operation2.setup(
        (p) => p.push((value, ctx) => {
          return ctx.dataSourceBuilder(value).request({ stream: true });
        })
      );
  ```

  - fullResponseBody has been deleted from the datasource now only can be used on the .request. This allow better intellisense on the response.
### dataSource compilation

  - before:
  datasource.json
  ```js
      service.myService.version.operation.setup(
        (p) => p.push((value, ctx) => {
          return ctx.dataSource(ctx).request({ resolveBodyOnly: true});
        })
      );
  ```
  - now:
  ```js
      service.myService.version.operation.setup(
        (p) => p.push((value, ctx) => {
          return ctx.dataSourceBuilder(value).request({ resolveBodyOnly: true});
        })
      );
        service.myService.version.operation2.setup(
        (p) => p.push((value, ctx) => {
          return ctx.dataSourceBuilder().request({ stream: true });
        })
      );
  ```

### CompileDataSource decorator

  - before:
  datasource.json
  ```js
      service.myService.version.operation.setup(
        (p) => p.push(compileDataSource((value, ctx) => {
          return ctx.dataSource.request({ resolveBodyOnly: true});
        })
      ));
  ```
  - now:
  ```js
      service.myService.version.operation.setup(
        (p) => p.push(compileDataSource((value, ctx, dataSource) => {
          return dataSource.request({ resolveBodyOnly: true});
        })
      ));
  ```

### Decorators

  - before:
  ```js
      const asValue = require('bautajs/decorators/as-value');
      service.myService.version.operation.push(asValue(1));
  ```
  - now: 
    * Raw decorators has been moved to the core module (asCallback, asValue, parallel, datasource, pipeline, resolver, step).
    * Request related decorators has been moved to @bautajs/datasource-rest module (request, compileDataSource).
    * Third party dependen decorators has been moved to a separated modules (template, filter, cache).
  ```js
      const { asValue } = require('@bautajs/core');
      service.myService.version.operation.setup(
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
    service.myService.version.operation.setup((p) => p.push(() => [{a:'1'}]).push(queryFilters()));
  ```

### Datasources

   - before: Datasources where rest connectors that used got library to do requests to third parties API's
   - now: Default datasources only define operations and data sources. For using datasources as connectors for third parties API's
   you have to use @bautajs/datasources-rest