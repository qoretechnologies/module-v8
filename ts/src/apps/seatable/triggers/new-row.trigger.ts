import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { seatableClient, SeaTableListRowsResponse, SeaTableRow } from '../client';
import { SEATABLE_APP_NAME, SeaTableError } from '../constants';
import { getSeaTableTableColumnsResponseType } from '../helpers/get-table-columns';
import { getSeaTableTableAllowedValues } from '../helpers/get-table-allowed-values';

const action = 'new_document';

const options = {
  table: {
    type: 'string',
    required: true,
    get_allowed_values: getSeaTableTableAllowedValues,
  },
} satisfies TQoreOptions;

const NewRow = QoreAppCreator.createLocalizedTrigger({
  app: SEATABLE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, url, table } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['table'],
      ErrorClass: SeaTableError,
    });

    const getItems = () => {
      return fetchLatestRows({
        token,
        url,
        table,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `seatable_${action}`,
      uniqueField: '_id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, url, table } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['table'],
      ErrorClass: SeaTableError,
    });

    const rows = await fetchLatestRows({
      token,
      url,
      table,
    });

    return rows?.length > 0 ? rows[0] : null;
  },
  event_info: {
    desc: 'SeaTable New Row Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        _id: { type: 'string' },
        _mtime: { type: 'date' },
        _ctime: { type: 'date' },
      },
    },
  },
  get_dynamic_type: getSeaTableTableColumnsResponseType,
});

export default NewRow;

type TFetchRowsOptions = {
  token: string;
  url: string;
  table: string;
};

const fetchLatestRows = async (options: TFetchRowsOptions): Promise<SeaTableRow[]> => {
  const { token, url, table } = options;
  const limit = 100;

  try {
    // Use list rows endpoint with sort by _mtime descending
    const response = await seatableClient.baseGet<SeaTableListRowsResponse>('rows/', {
      connectionOptions: { url, token },
      params: {
        table_name: table,
        limit: String(limit),
        // Sort by modification time descending to get latest rows
        order_by: '_mtime',
        direction: 'desc',
      },
    });

    return response?.rows || [];
  } catch (error) {
    throw new SeaTableError(`Failed to fetch latest rows: ${error instanceof Error ? error.message : error}`);
  }
};
