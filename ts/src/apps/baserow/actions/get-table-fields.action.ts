import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BASEROW_APP_NAME, BaserowError } from '../constants';
import { baserowApiClient } from '../helpers/constants';
import { getBaserowTableAllowedValues } from '../helpers/get-table-allowed-values';

const action = 'get_table_fields';

const options = {
  table: {
    type: 'number',
    required: true,
    get_allowed_values: getBaserowTableAllowedValues,
  },
} satisfies TQoreOptions;

const getTableFields = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BASEROW_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, url, table } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'url'],
      optionFields: ['table'],
      ErrorClass: BaserowError,
    });

    try {
      const response = await baserowApiClient<{ id: string }[]>({
        path: `database/fields/table/${table}`,
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
        table_id: { type: 'number' },
        order: { type: 'number' },
        type: { type: 'string' },
        primary: { type: 'boolean' },
        read_only: { type: 'boolean' },
        description: { type: 'string' },
        immutable_type: { type: 'boolean' },
        immutable_properties: { type: 'boolean' },
        text_default: { type: 'string' },
      },
    },
  },
});

export default getTableFields;
