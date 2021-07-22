# iff decorator

The `iff` decorator allows you to execute given Pipeline.StepFunction conditionally or acts as a pass-through if the provided condition is not satisfied. You can explore the source code [here](https://github.axa.com/Digital/bauta-nodejs/blob/master/packages/bautajs-core/src/decorators/iff.ts).

## Example usage

### 1. Provided condition not satisfied

Here `iff` works as a pass-through, since the first argument will evaluate to false.

```javascript
import { iff, pipeline } from @bautajs/core


const pipeline = pipe(
  () => 'Plastic is not fantastic!',
  iff(
    prev => prev.includes('Plastic is fantastic!'),
    () => 'Plastic is fantastic!'
  )
);

// => 'Plastic is not fantastic!'

```

### 2. Provided condition satisfied

Here the `manageOnlyStringsPipeline` will be executed since the first argument of `iff` evaluates to true.

```javascript
import { iff, pipeline } from @bautajs/core

const randomPreviousPipeline = pipe(() => 'I am so random!');
const manageOnlyStringsPipeline = pipe(() => 'I can manage only strings');

const pipeline = pipe(
  randomPreviousPipeline,
  iff(prev => typeof prev === 'string', manageOnlyStringsPipeline)
);

 // => 'I can manage only strings'
```
