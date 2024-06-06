import { BautaJSExpress } from '@axa/bautajs-express';
import apiDefinition from '../../api-definition.json' assert { type: 'json' };

export default new BautaJSExpress({
  apiDefinition,
  resolversPath: './server/resolvers/**/*resolver.js',
  staticConfig: {
    someVar: 2
  }
});
