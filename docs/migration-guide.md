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
  datasource.json
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
          return ctx.dataSource(value).request({ resolveBodyOnly: true});
        })
      );
        service.myService.version.operation2.setup(
        (p) => p.push((value, ctx) => {
          return ctx.dataSource(value).request({ stream: true });
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
          return ctx.dataSource(value).request({ resolveBodyOnly: true});
        })
      );
        service.myService.version.operation2.setup(
        (p) => p.push((value, ctx) => {
          return ctx.dataSource().request({ stream: true });
        })
      );
  ```

### Decorators

  - before:
  ```js
      const request = require('bautajs/decorators/request');
      service.myService.version.operation.push(request());
  ```
  - now:
  ```js
      const { request } = require('@bautajs/decorators');
      service.myService.version.operation.setup(
        (p) => p.push(request())
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
    const { queryFilters } = require('@bautajs/filters-decorator');
    const ctx = {req, res};
    service.myService.version.operation.setup((p) => p.push(() => [{a:'1'}]).push(queryFilters()));
  ```