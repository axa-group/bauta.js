# tap decorator

Decorator that allows to transparently perform actions or side-effects, such as logging without losing the previous step result. You can explore the source code [here](../../packages/bautajs-core/src/decorators/tap.ts).

In case that the tapped pipeline behaves asynchronously, its execution will be done in parallel but its result will be ignored (be it resolved value or a rejected error). Note that any side effect that happens
during this execution pipeline will take place even if its initial request has finished.


## Examples

### 1. Do a console log

```javascript
  const { tap, step, pipe } = require('@axa/bautajs-core');

  const randomPreviousStep = step(() => 'I am so random!');

   const pipeline = pipe(
     randomPreviousStep,
     tap((prev) => {
       console.log(`some intermediate step. Prev is ${prev}`);

       return 'this value will be lost';
     }),
     (prev) => {
       // prev will be always the result of randomPreviousStep no matter what the tap function returns
       console.log(prev);
     }
   );

// => 'some intermediate step. Prev is I am so random!'
// => 'I am so random!'
```

### 2. Tap an asynchronous and slow task

```javascript
  const { tap, step, pipe } = require('@axa/bautajs-core');

  const randomPreviousStep = step(() => 'I am so random!');

   const pipeline = pipe(
     randomPreviousStep,
     tap((prev) => {
       console.log('we are inside the tap!');

       await delay(a_lot_of_time);

       await executeASideEffect();

       console.log('we may have made some side effects!' );
       return 'this value will be lost';
     }),
     (prev) => {
       console.log(prev);
     }
   );

Assuming there is no error in the execution of the pipeline:
// => 'we are inside the tap!'
// => 'I am so random!'
// ...
// => 'we may have made some side effects!'

```


