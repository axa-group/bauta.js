# tap decorator

Decorator that allows to transparently perform actions or side-effects, such as logging without loosing the previous step result. You can explore the source code [here](../../packages/bautajs-core/src/decorators/tap.ts).

## Example

### 1. Do a console log

```javascript
  const { tap, step, pipe } = require('@axa-group/bautajs-core');

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
