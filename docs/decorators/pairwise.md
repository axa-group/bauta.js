# pairwise decorator

The `pairwise` decorator returns the result by the previous step function and the result of current step that is decorated. Both are returned inside an array. You can explore the source code [here](../../packages/bautajs-core/src/decorators/pairwise.ts).

## Example usage

Here we are just adding the imdb id to a given movie object.

```javascript
  const { pairwise, step, pipe } =  require('@axa/bautajs-core');

    const getMovie = step(() => ({ name: 'star wars' }));
    const getMovieImdbIdAsync = step(() => Promise.resolve('imdb12354'));

    const pipeline = pipe(
      getMovie,
      pairwise(getMovieImdbIdAsync),
      ([movie, imdbId]) => ({
      ...movie,
      imdb_id: imdbId
    }));
 ```

## Error handling

 Errors thrown inside pairwise `StepFunctions` are propagated as any other `StepFunction`.
 In the example above in case that `getMovieImdbIdAsync` throws an error, the pipeline will stop there and the error will be propagated. You can learn about step and pipelines handling errors [here](../resolvers.md#handling-errors).
