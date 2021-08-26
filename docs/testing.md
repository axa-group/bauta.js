# Testing BautaJS components

In this examples, we will use [jest](https://jestjs.io) as the testing framework.

### Test a Step function or a Pipeline

Since pipelines and step function result are the same thing, both can be tested using the same pattern.

Imagine we have the following pipeline:

```js
const { pipe } = require('@bautajs/core');

module.export.pipeline = pipe(() => {
    const someObj = {
        foo: 1,
        boo: 2
    }

    return someObj;
}, (someObj, ctx) => {
 ctx.log.info(someObj, 'This is my object');

 return someObj;
}, (someObj, ctx, bautajs) => {
 return {
     ...someObj,
     id: ctx.data.id,
     constantData: bautajs.staticConfig.myConstant
 }
});
```

To test this we need three main things:
 - Create some fake BautaJS application.
 - Create a context.
 - Execute the pipeline with both things.

 ```js
  const { BautaJS, createContext } = require('@bautajs/core');
  const { myPipeline } = require('./pipeline');

  describe('test', () => {
      let bautajsInstance;
      beforeAll(() => {
          // Create the bauta instance with the required constants for the pipeline.
          bautajsInstance = new BautaJS({
              staticConfig: {
                myConstant: 'this is a constant'
              }
          })
      })
      test('some test', async () => {
        // Create a context with data needed for the pipeline
        const ctx = createContext({ data: { id:'someId' } });
        
        await expect(myPipeline(null, ctx, bautajsInstance)).resolve.toStrictEql({
            foo: 1,
            boo: 1,
            id: 'someId',
            constantData: 'this is a constant'
        })
      });
  })
 ```

 #### Test a logger in the pipeline

 Assuming we have the previous mentioned pipeline and we want to test that the info log `This is my object` is triggered.

 So let's create the test for it:

 ```js
  const { BautaJS, createContext } = require('@bautajs/core');
  const { myPipeline } = require('./pipeline');

  describe('test', () => {
      let bautajsInstance;
      beforeAll(() => {
          // Create the bauta instance with the required constants for the pipeline.
          bautajsInstance = new BautaJS({
              staticConfig: {
                myConstant: 'this is a constant'
              }
          })
      })
      test('some test', async () => {
        // Create a context with data needed for the pipeline
        const ctx = createContext({ data: { id:'someId' } });

        //! Very important line, since the provider will 
        //! create a child log and you will lose the spy 
        //! on the children logger.
        ctx.log.child = () => ctx.log;
        const spy = jest.spyOn(ctx.log, 'info');
        
        await expect(myPipeline(null, ctx, bautajsInstance)).resolve.toStrictEql({
            foo: 1,
            boo: 1,
            id: ctx.data.id,
            constantData: 'this is a constant'
        });

        expect(spy).toHaveBeenCalledTimes(1);
      });
  })
 ```
 

## Test a restProvider

Testing a restProvider also follow more or less same philosophy as the pipeline testing.

Imagine we have the following restProvider:

```js
const { restProvider } = require('@bautajs/rest-datasource');

module.export.myRestProvider = restProvider((client, prev, ctx, bautaJS) => {

return client.get({
    url: `${batuaJS.staticConfig.BASE_URL}`,
    body: {
        foo: prev.foo,
        boo: prev.boo
    }
});
});
```

To test this we need three main things:
 - Create some fake BautaJS application.
 - Create a context.
 - Execute the restProvider with both things.

```js
  const { BautaJS, createContext } = require('@bautajs/core');
  const { myRestProvider } = require('./my-rest-provider');

  describe('test', () => {
      let bautajsInstance;
      beforeAll(() => {
          // Create the bauta instance with the required constants for the pipeline.
          bautajsInstance = new BautaJS({
              staticConfig: {
                BASE_URL: 'https://base.url'
              }
          })
      })
      test('some test', async () => {
        // Create a context
        const ctx = createContext({});
        // Rest provider needs to be builded before call it.
        const stepFn = myRestProvider();
        // Create data present in previous step or what is the same,
        // data resultant from the execution of previous steps in the pipeline we will plug in this rest call.
        const previousStepData = {
            foo: 'test',
            boo: 'type1'
        }
        
        await expect(stepFn(previousStepData, ctx, bautajsInstance)).resolve.toStrictEql({
            responseBodyField: 'ok'
        })
      });
  });
```

### Test a resolver

Finally to test the biggest part of a BautaJS component a `resolver` you will need to bootstrap the BautaJS instance in order to test all the flow.

Let's create our dummy resolver using the pipeline that we already defined on the previous sections:

dummy-resolver.js
```js
const { resolver } = require('@bautajs/core');
const { myPipeline } = require('./pipeline');

module.exports = resolver((operations) => {
    operations.getCats.setup(myPipeline)
});
```

index.js
```js
const { BautaJS } = require('@bautajs/core');
const bautaInstance =  new BautaJS({
    staticConfig: {
        myConstant: 'this is a constant'
    }
});

module.exports.bautajsInstance = bautajsInstance;
```

Now we can start our testing. For that we will need:

- Bootstrap BautaJS instance on the test
- Call the operation to test

```js
  const { BautaJS, createContext } = require('@bautajs/core');
  const { bautaInstance } = require('./index');

  describe('test', () => {
      let bautajsInstance;
      beforeAll(async() => {
          // bootstrap the bautajs instance.
          await bautaInstance.bootstrap();
      })
      test('some test', async () => {
        // Create a context
        const ctx = createContext({});
        // Rest provider needs to be builded before call it.
        const stepFn = myRestProvider();
        // Create data present in previous step or what is the same,
        // data resultant from the execution of previous steps in the pipeline we will plug in this rest call.
        const previousStepData = {
            foo: 'test',
            boo: 'type1'
        }
        
        await expect(bautaInstance.operations.getCats.run({data: {
            id:'someId'
        }})).resolve.toStrictEql({
            foo: 1,
            boo: 1,
            id: 'someId',
            constantData: 'this is a constant'
        })
      });
  });
```
