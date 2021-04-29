## BautaJS template decorator

A decorator to include an compilable template json Pipeline.StepFunction on the pipeline.
The decorator will use [stjs](https://www.npmjs.com/package/stjs|stjs) package to compile the given json template.
Inside the json the following variables will be injected:
  - ctx: the current context (req, res...)
  - previousValue: the previous result
  - env: the current nodejs environment variable


## How to install

```console
  npm install @bautajs/decorator-template
```

## Usage

Include it on the Pipeline.StepFunction you need to apply the filters, the decorator will automatically filter the previous Pipeline.StepFunction result using
the loopback filters coming from the returned value on the selector.

```js
  const { resolver } = require('@bautajs/core');
  const { template } = require('@batuajs/decorators');
 
  const myTemplate = {
     "acceptHeader": "{{ctx.data.headers.accept}}",
     "id": "{{previousValue.id}}",
     "myEnv": "{{env.myEnv}}"
  }
 
module.exports = resolver((operations)=> {
      operations.v1.op1.setup(template(myTemplate));
});  
```

## Contributing

You can read the guide of how to contribute at [Contributing](../../CONTRIBUTING.md).

## Code of Conduct

You can read the Code of Conduct at [Code of Conduct](../../CODE_OF_CONDUCT.md).

## Who is behind it?

This project is developed by AXA Group Operations Spain S.A.

### License

Copyright (c) AXA Group Operations Spain S.A.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

