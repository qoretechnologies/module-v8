import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { baserowClient } from '../client';
import { BASEROW_APP_NAME, BaserowError } from '../constants';

const action = 'list_tables';

const options = {} satisfies TQoreOptions;

const listTables = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BASEROW_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, url } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'url'],
      ErrorClass: BaserowError,
    });

    try {
      const response = await baserowClient.get<{ id: string }[]>(`database/tables/all-tables`, {
        token,
        connectionOptions: { url },
      });

      return response;
    } catch (error) {
      throw new BaserowError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'number' },
        name: { type: 'string' },
        order: { type: 'number' },
        database_id: { type: 'number' },
      },
    },
  },
});

export default listTables;
