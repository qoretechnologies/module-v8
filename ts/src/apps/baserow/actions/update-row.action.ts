import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BASEROW_APP_NAME, BaserowError } from '../constants';
import { baserowApiClient } from '../helpers/constants';
import { getBaserowTableAllowedValues } from '../helpers/get-table-allowed-values';
import { getBaserowTableRowsAllowedValues } from '../helpers/get-table-row-allowed-values';
import {
  getBaserowTableColumnOptions,
  getBaserowTableColumnsResponseType,
} from '../helpers/get-table-fields';

const action = 'update_row';

const options = {
  table: {
    type: 'number',
    required: true,
    get_allowed_values: getBaserowTableAllowedValues,
    on_change: ['refetch'],
  },
  row: {
    type: 'number',
    required: true,
    get_allowed_values: getBaserowTableRowsAllowedValues,
    depends_on: ['table'],
  },
  data: {
    type: 'hash',
    required: true,
    get_dynamic_type: getBaserowTableColumnOptions,
    depends_on: ['table'],
  },
} satisfies TQoreOptions;

const updateRow = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BASEROW_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, url, table, row, data } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'url'],
      optionFields: ['table', 'row', 'data'],
      ErrorClass: BaserowError,
    });

    try {
      const response = await baserowApiClient<{ id: string }>({
        path: `database/rows/table/${table}/${row}`,
        method: 'PATCH',
        token,
        url,
        body: data,
        params: {
          user_field_names: 'true',
        },
      });

      return response;
    } catch (error) {
      throw new BaserowError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'number' },
    },
  },
  get_dynamic_response_type: getBaserowTableColumnsResponseType,
});

export default updateRow;
