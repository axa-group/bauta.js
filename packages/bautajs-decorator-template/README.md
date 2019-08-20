## BautaJS template decorator

A decorator to include an compilable template json OperatorFunction on the pipeline.
The decorator will use [stjs](https://www.npmjs.com/package/stjs|stjs) package to compile the given json template.
Inside the json the following variables will be injected:
  - ctx: the current context (req, res...)
  - previousValue: the previous result
  - env: the current nodejs environment variable


## How to install

Make sure that you have access to [Artifactory][1]

```console
  npm install @bautajs/decorator-template
```

## Usage

Include it on the OperatorFunction you need to apply the filters, the decorator will automatically filter the previous OperatorFunction result using
the loopback filters comming from `ctx.req.query.filter`

```js
  const { resolver } = require('@bautajs/core');
  const { template } = require('@batuajs/decorators');
 
  const myTemplate = {
     "acceptHeader": "{{ctx.req.headers.accept}}",
     "id": "{{previousValue.id}}",
     "myEnv": "{{env.myEnv}}"
  }
 
module.exports = resolver((operations)=> {
      operations.v1.op1.push(template(myTemplate));
});  
```

[1]: https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/
