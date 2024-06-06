import { BautaJSExpress } from '@axa/bautajs-express';
import apiDefinition from '../../api-definition.json' assert { type: 'json' };

import logger from './custom-logger-bauta';

module.exports = new BautaJSExpress({
  apiDefinition,
  resolversPath: './server/resolvers/**/*resolver.js',
  staticConfig: {
    someVar: 2
  },
  logger: logger('bauta-logger')
});
