import { fileURLToPath } from 'url';
import { dirname } from 'path';

/**
 * utility function to simulate the non-existing __dirname in ES6 modules
 *
 * based on https://stackoverflow.com/questions/8817423/why-is-dirname-not-defined-in-node-repl and
 * https://nodejs.org/docs/latest-v15.x/api/esm.html#esm_no_filename_or_dirname
 *
 * @returns
 */
export function getDirname() {
  const filename = fileURLToPath(import.meta.url);
  const currentDirname = dirname(filename);

  return currentDirname;
}
