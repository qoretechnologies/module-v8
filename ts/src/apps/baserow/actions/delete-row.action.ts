import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { baserowClient } from '../client';
import { BASEROW_APP_NAME, BaserowError } from '../constants';
import { getBaserowTableAllowedValues } from '../helpers/get-table-allowed-values';
import { getBaserowTableRowsAllowedValues } from '../helpers/get-table-row-allowed-values';

const action = 'delete_row';

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
} satisfies TQoreOptions;

const deleteTableRow = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BASEROW_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, url, table, row } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'url'],
      optionFields: ['table', 'row'],
      ErrorClass: BaserowError,
    });

    try {
      await baserowClient.delete(`database/rows/table/${table}/${row}`, {
        token,
        connectionOptions: { url },
      });
    } catch (error) {
      throw new BaserowError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
});

export default deleteTableRow;
