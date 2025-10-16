import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BASEROW_APP_NAME, BaserowError } from '../constants';
import { baserowApiClient } from '../helpers/constants';

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
      const response = await baserowApiClient<{ id: string }[]>({
        path: `database/tables/all-tables`,
        method: 'GET',
        token,
        url,
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
