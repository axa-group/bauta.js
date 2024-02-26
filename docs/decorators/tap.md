# `tap` decorator

Decorator that allows to transparently perform actions or side-effects, such as logging without loosing the previous step result. You can explore the source code [here](../../packages/bautajs-core/src/decorators/tap.ts).

## `tap` decorator flow

The `tap` decorator accepts any number of step functions and executes them sequentially.

The `tap` decorator behaviour in a few words:

If all goes well (no errors), at the end of the `tap` decorator execution, you will get as the result of this decorator the value returned by the previous step of this decorator (or in other words, the first element received by the first step function of the `tap` decorator).

If there is an error, the error will be managed by the error handler attached to the decorator (be it the default one or a custom set through the `catchError` function). This can end in two cases: 
- the error handler throws an error --> then this error is thrown by the `tap` decorator
- the custom error handler does not throw any error --> then, as in the happy path case, the `tap` decorator returns as the result of this decorator step function the same value returned by the previous step to this decorator.

### Short summary of `tap` behaviour

At the end of `tap` decorator you will get:

- an error that has interrupted the step function flow
- the same value that was received by the first step function of the `tap` decorator if no error was triggered and thrown.


### the flow inside `tap` is sequential as a normal pipeline

While at the end of the step functions decorated by `tap` you get the input value of the first step, the execution INSIDE `tap` follows the step function pattern in which the values are passed between steps.

```js
export function thisIsAGoodPipeline() {
  return pipe(
    stepFunctionReturnsAAA,    
    tap(
      stepFunctionReturnsBBB,     // --> input parameter of stepFunctionReturnsBBB is AAA
      stepFunctionReturnsCCC,     // --> input parameter of stepFunctionReturnsCCC is BBB (not AAA)
      stepFunctionReturnsDDD      // --> input parameter of stepFunctionReturnsDDD is CCC (not AAA)
    ),
    stepFunctionReturnsEEE        // --> input parameter of stepFunctionReturnsEEE is AAA (CCC is lost)
  );
}


```

### Beware nesting step functions inside tap

The `tap` decorator is useful to process side effects knowing that at the end you will get the origin value, but it can make readibility hard if you compose a lot of nested functions inside it. Our advice is to create steps accordingly and call them from the decorator to improve readibility.

```javascript
// do this
export function thisIsAGoodPipeline() {
  return pipe(
    firstStepFunction,
    secondStepFunction,
    tap(sideEffectValidationStepFunction),
    thirdStepFunction
  );
}

// avoid this
export function thisIsABadPipeline() {
  return pipe(
   firstStepFunction,
    secondStepFunction,
    tap(async(prev, ctx, bautajs) => {
      // Code to access database
      // Code to validate certain rules
      // Code to decide whether the rules are meet or not and possibly throw an error
    }),
    thirdStepFunction
  );
}

```

### error handling and custom error handling limitations

The `tap` decorator allows for a custom error handler. If you do not provide any, the default behaviour is just throw the error through the decorator.

Two considerations are important if you decide to provide a custom error handling:

- First: the error handling function must be synchronous. 

- Second: you may ignore any error inside tap through your custom error handling function but the value returned nevertheless will always be the input of the first step function of the decorator, *regardless* of what value you may put in this custom error handler. This is because `tap` deals only with side effects inside their step functions.

## `tap` decorator usage

There are two use cases where this decorator is useful:

1. Synchronous Logging without need to return the previous value
2. Asynchronous validation without need to drag the value between steps: this simplifies the pattern of usage because you do not need to worry about maintaining the value that you want to use *after* the validation or have to worry about mappings like when using `pairwise`.


## Example

### 1. Do a console log

```javascript
  const { tap, step, pipe } = require('@axa/bautajs-core');

  const randomPreviousStep = step(() => 'I am so random!');

  const sideEffectStep = (prev) => {
    console.log(`some intermediate step. Prev is ${prev}`);

    return 'this value will be lost';
  };

  const pipeline = pipe(
    randomPreviousStep,
    tap(sideEffectStep),
    (prev) => {
      // prev will be the result of randomPreviousStep 
      console.log(prev);
    }
  );

// => 'some intermediate step. Prev is I am so random!'
// => 'I am so random!'
```

### 2. Asynchronous validation


```javascript
  const { tap, step, pipe } = require('@axa/bautajs-core');

  const generateAnObjectToStore = step(() => 'I am so random!');

  // This is asyncrhonous because this validation requires database or datasource access
  const validateThatTheObjectIsCool = step(async (prev, ctx, bautajs) => {
   
    // database access

    if (theObjectIsNotCool) {
      throw new Error('Do not save uncool objects');
    }
  });



  const pipeline = pipe(
    generateAnObjectToStore,
    tap(validateThatTheObjectIsCool),
    storeTheObject
  );

// => case 1. Error throw inside tap --> we get the error and storeTheObject is never called

// => case 2. No Error thrown from tap  --> storeTheObject has the value generated in generateAnObjectToStore, not the undefined returned by validateThatTheObjectIsCool
```


