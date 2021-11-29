# parallel map decorator

The `parallelMap` decorator allows to loop over the selected array and create a promise for each array item with the given mapFn, then it will resolve everything in parallel using [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all). You can explore the source code [here](../../packages/bautajs-core/src/decorators/parallel-map.ts).

## Example

Here we are just looping over the movies and adding extra information

```javascript
  const { map, pipe, step  } = require('@axa/bautajs-core')
  const { getGenreFromMovie }  } = require('./some-datasource')

  const getMovies = step(() => [{name: 'star wars'},{ name: 'petter' }]);
  const addGenresNamesToMovieAsync = pipe(getGenreFromMovie(), ([genre, movie]) => ({...movie, genre}));
  const addTmdbIdToMovie = step((movie) => ({...movie, tmdbId:'1234'}));

   const pipeline = pipe(
     getMovies,
     parallelMap((movies) => movies, pipe(addGenresNamesToMovieAsync, addTmdbIdToMovie))
   );
 ```
