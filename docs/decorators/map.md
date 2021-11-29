# map decorator

The `map` decorator allows to loop over the given selected array and map each item. You can explore the source code [here](../../packages/bautajs-core/src/decorators/map.ts).

**The map function can not be async. If you need to use async, use the [parallelMap](./parallelMap) decorator.**

## Example

Here we are just looping over the movies and adding extra information

```javascript
  const { map, pipe, step } = require('@axa/bautajs-core')

  const getMovies = step(() => [{name: 'star wars'}, { name: 'petter' }]);
  const addGenresNamesToMovie = step((movie) => ({...movie, genre:'action'}));
  const addTmdbIdToMovie = step((movie) => ({...movie, tmdbId:'1234'}));

   const pipeline = pipe(
     getMovies,
     map(
        (movies) => movies,
        pipe(addGenresNamesToMovie, addTmdbIdToMovie)
      )
   );
 ```
