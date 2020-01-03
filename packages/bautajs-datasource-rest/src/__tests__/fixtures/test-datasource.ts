import { restDataSource } from '../../index';

export default restDataSource({
  providers: [
    {
      id: 'operation1',
      options(_, ctx) {
        return {
          someVariableOption: ctx.req.variableOption,
          method: 'GET',
          url: 'https://google.com/'
        };
      }
    }
  ]
});
