# Using lodash FP functions

Lodash FP functions can be pushed to the execution chain.

```js
// my-resolver.js
const flow = require('lodash/fp/flow');
const map = require('lodash/fp/map');
const filter = require('lodash/fp/filter');
const { asValue } = require('@bautajs/core');

module.export = (services) => {
  services.test.v1.op1
  .setup(p => 
    p.push(asValue(flow(
        map(['id':'myIdMapped']),
        filter(['tag','dogs'])
      )
    ))
  );
  // Use it without flow (not recomended sice push will create a promise always)
  services.test.v1.op1
   .setup(p => 
      p.push(asValue(map(['id':'myIdMapped'])))
      p.push(asValue(filter(['tag','dogs'])))
    );
}
```