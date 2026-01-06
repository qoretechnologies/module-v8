import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { baserowClient } from '../client';
import { BASEROW_APP_NAME, BaserowError } from '../constants';
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
      const response = await baserowClient.get<{ id: string }[]>(`database/fields/table/${table}`, {
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
        table_id: { type: 'number' },
        order: { type: 'number' },
        type: { type: 'string' },
        primary: { type: 'bool' },
        read_only: { type: 'bool' },
        description: { type: 'string' },
        immutable_type: { type: 'bool' },
        immutable_properties: { type: 'bool' },
        text_default: { type: 'string' },
      },
    },
  },
});

export default getTableFields;
