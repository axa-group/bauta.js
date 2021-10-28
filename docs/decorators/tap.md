# tap decorator

Decorator that allows to transparently perform actions or side-effects, such as logging and return the previous step result.. You can explore the source code [here](https://github.axa.com/Digital/bauta-nodejs/blob/master/packages/bautajs-core/src/decorators/tap.ts).

## Example usage

### 1. Do a console log

```javascript
  const { tap, step, pipe } require('@bautajs/core');
 
  const randomPreviousPipeline = step(() => 'I am so random!');
 
   const pipeline = pipe(
     randomPreviousPipeline,
     tap((prev) => {
       console.log(`some intermediate step. Prev is ${prev}`);
     }),
     (prev) => {
       console.log(prev);
     }
   );

// => 'some intermediate step. Prev is I am so random!'
// => 'I am so random!'

```
