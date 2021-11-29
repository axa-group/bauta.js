# iif decorator

The `iif` decorator allows you to execute given Pipeline.StepFunction conditionally or acts as a pass-through if the provided condition is not satisfied. You can explore the source code [here](../../packages/bautajs-core/src/decorators/iif.ts).

## Example

### 1. Provided condition satisfied

Here the `manageOnlyStringsPipeline` will be executed since the first argument of `iif` evaluates to true.

```javascript
const { iif, pipe, step } = require('@axa-group/bautajs-core')


const stepReturnString = step(() => 'I am so random!');
const stepManagesStrings = step(() => 'I can manage only strings');

const pipeline = pipe(
  stepReturnString,
  iif(prev => typeof prev === 'string', stepManagesStrings)
);

 // => 'I can manage only strings'
```

### 2. Provided condition not satisfied without else pipeline

Here `iif` works as a pass-through, since the first argument will evaluate to false.

```javascript
const { iif, pipe } = require('@axa-group/bautajs-core')

const pipeline = pipe(
  () => 'Plastic is not fantastic!',
  iif(
    prev => prev.includes('Plastic is fantastic!'),
    () => 'Plastic is fantastic!'
  )
);

// => 'Plastic is not fantastic!'

```

### 3. Provided condition not satisfied with else pipeline

Here the else pipeline will be executed since the first argument of `iif` evaluates to false.

```javascript
const { iif, pipe } = require('@axa-group/bautajs-core')


const pipeline = pipe(
  () => 'Plastic is not fantastic!',
  iif(
    prev => prev.includes('Plastic is fantastic!'),
    () => 'Plastic is fantastic!',
    () => 'Else: Pink plastic partially problematic'
  )
);

// => 'Else: Pink plastic partially problematic!'

```
