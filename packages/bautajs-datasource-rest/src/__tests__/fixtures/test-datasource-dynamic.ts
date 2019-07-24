import { restDataSource } from '../../index';

export default restDataSource({
  providers: [
    {
      id: 'operation1',
      options(_, ctx) {
        return {
          someVariableOption: ctx.req.variableOption,
          url: `https://google.com/${ctx.data.path}`
        };
      }
    }
  ]
});
