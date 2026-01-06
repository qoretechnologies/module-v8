import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { baserowClient } from '../client';
import { BASEROW_APP_NAME, BaserowError } from '../constants';
import { getBaserowTableAllowedValues } from '../helpers/get-table-allowed-values';
import {
  getBaserowTableColumnOptions,
  getBaserowTableColumnsResponseType,
} from '../helpers/get-table-fields';
import { getBaserowTableRowsAllowedValues } from '../helpers/get-table-row-allowed-values';

const action = 'create_row';

const options = {
  table: {
    type: 'number',
    required: true,
    get_allowed_values: getBaserowTableAllowedValues,
    on_change: ['refetch'],
  },
  data: {
    type: 'hash',
    required: true,
    get_dynamic_type: getBaserowTableColumnOptions,
    depends_on: ['table'],
  },
  before_row_id: {
    type: 'number',
    required: false,
    allowed_values_creatable: true,
    get_allowed_values: getBaserowTableRowsAllowedValues,
    depends_on: ['table'],
  },
} satisfies TQoreOptions;

const createRow = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BASEROW_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, url, table, data } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'url'],
      optionFields: ['table', 'data'],
      ErrorClass: BaserowError,
    });

    const before = obj?.before_row_id ? String(obj.before_row_id) : undefined;

    try {
      const response = await baserowClient.post<{ id: string }>(`database/rows/table/${table}`, data, {
        token,
        connectionOptions: { url },
        params: {
          user_field_names: 'true',
          ...(before && { before }),
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
      order: { type: 'number' },
    },
  },
  get_dynamic_response_type: getBaserowTableColumnsResponseType,
});

export default createRow;
