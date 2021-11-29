# retryWhen decorator

The `retryWhen` decorator allows you to execute a given Pipeline.StepFunction until the condition is met or a certain number of attempts happen. You can configure a timeout between each retry. You can explore the source code [here](../../packages/bautajs-core/src/decorators/retry-when.ts).

## Example

### 1. Without any option passed as parameter uses the defaults

Here `retryWhen` will work with default values:

- maxRetryAttempts: 3
- scalingDuration: 10 ms
- the error thrown will be the one provided by the decorator


```js
const { retryWhen } = require('@axa-group/bautajs-core')

const pipeline =
  retryWhen(
    () => 30,
    (prev) => prev > 25
  )
;

// => 30 after the first attempt
```

```js
const { retryWhen } = require('@axa-group/bautajs-core')

const pipeline =
  retryWhen(
    (_, ctx) => {
      const toIncrease = ctx.data.counter || 0;
      ctx.data.counter = toIncrase + 1;
      return ctx.data.counter;
    },
    (prev) => prev > 7
  )
;

// => default retryError thrown with default message "Condition was not meet in 3 retries." (the condition is not meet before 3 attempts)
```

### 2. With options tailored to the user needs

Here `retryWhen` will work with custom values:

- maxRetryAttempts: number of attempts
- scalingDuration: the timeout to wait after each attemp
- an error with a custom message


```js
const { retryWhen } = require('@axa-group/bautajs-core')

const pipeline =
  retryWhen(
    () => 'I am a very long response from a provider datasource',
    (prev) => Array.isArray(prev),   // Condition will never be met,
    {
      maxRetryAttempts: 10,
      scalingDuration: 500,
      error: new Error('This is going to be an error for sure')
    }
  )
;

// => custom error thrown after attempts defined in maxRetryAttempts. After each attemp we will wait scalingDuration time
```
