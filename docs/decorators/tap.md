# tap decorator

Decorator that allows to transparently perform actions or side-effects, such as logging without loosing the previous step result. You can explore the source code [here](../../packages/bautajs-core/src/decorators/tap.ts).

## tap decorator flow

The `tap` decorator accepts any number of step functions and executes them sequentially.

The `tap` decorator behaviour in a few words:

If all goes well (no errors), at the end of the `tap` decorator execution, you will get as the result of this decorator the value returned by the previous step of this decorator (or in other words, the first element received by the first step function of the tap decorator).

If there is an error, the error will be managed by the error handler attached to the decorator (be it the default one or a custom set through the `catchError` function). This can end in two cases: 
- the error handler throws an error --> then this error is thrown by the `tap` decorator
- the custom error handler does not throw any error --> then, as in the happy path case, the `tap` decorator returns as the result of this decorator step function the same value returned by the previous step to this decorator.

### Short summary of `tap` behaviour

At the end of `tap` decorator you will get:

- an error that has interrupted the step function flow
- the same value that was received by the first step function of the tap decorator if no error was triggered and thrown.

## tap decorator usage

There are two use cases where this decorator is useful:

1. Synchronous Logging without need to return the previous value
2. Asynchronous validation without need to drag the value between steps: this simplifies the pattern of usage because you do not need to worry about maintaining the value that you want to use *after* the validation or have to worry about mappings like when using `pairwise`.

### Caution

The tap decorator is very useful to proc side effects knowing that at the end you will get the origin value, but it can make readibility hard if you compose a lot of nested functions inside it. Our advice is to create steps accordingly and call them from the decorator to improve readibility.

```javascript
// do this
export function thisIsAGoodPipeline() {
  return pipe(
   firstStepFunction,
    secondStepFunction(),
    tap(sideEffectValidationStepFunction()),
    thirdStepFunction()
  );
}

// avoid this
export function thisIsABadPipeline() {
  return pipe(
   firstStepFunction,
    secondStepFunction(),
    tap(async(prev, ctx, bautajs) => {
      // Code to access database
      // Code to validate certain rules
      // Code to decide whether the rules are meet or not and possibly throw an error
    }),
    thirdStepFunction()
  );
}

```

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

