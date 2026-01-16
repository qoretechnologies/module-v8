import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { fromV3Response, nocodbClient, NocoDBV3Response } from '../client';
import { NOCODB_APP_NAME, NocoDBError } from '../constants';
import { getNocoDBBaseAllowedValues } from '../helpers/get-base-allowed-values';
import { getNocoDBTableIdAllowedValues } from '../helpers/get-table-allowed-values';
import { getNocoDBTableColumnsResponseType } from '../helpers/get-table-columns';
import { getNocoDBWorkspaceAllowedValues } from '../helpers/get-workspace-allowed-values';

const action = 'new_document';

const options = {
  workspaceId: {
    type: 'string',
    required: true,
    get_allowed_values: getNocoDBWorkspaceAllowedValues,
    on_change: ['refetch'],
  },
  baseId: {
    type: 'string',
    required: true,
    get_allowed_values: getNocoDBBaseAllowedValues,
    on_change: ['refetch'],
  },
  table: {
    type: 'string',
    required: true,
    get_allowed_values: getNocoDBTableIdAllowedValues,
  },
  where: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const NewRow = QoreAppCreator.createLocalizedTrigger({
  app: NOCODB_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, table, url, baseId } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['table', 'baseId'],
      ErrorClass: NocoDBError,
    });

    const { where } = context.opts || {};

    const getItems = () => {
      return fetchLatestRows({
        token,
        table,
        url,
        baseId,
        where,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `nocodb_${action}`,
      uniqueField: 'id', // v3 uses lowercase 'id'
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, table, url, baseId } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['table', 'baseId'],
      ErrorClass: NocoDBError,
    });

    const { where } = context.opts || {};

    const rows = await fetchLatestRows({
      token,
      table,
      url,
      baseId,
      where,
    });

    return rows?.length > 0 ? rows[0] : null;
  },
  event_info: {
    desc: 'NocoDB New Row Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' }, // v3 uses lowercase 'id'
      },
    },
  },
  get_dynamic_type: getNocoDBTableColumnsResponseType,
});

export default NewRow;

type TFetchRowsOptions = {
  token: string;
  table: string;
  url: string;
  baseId: string;
  where?: string;
};

const fetchLatestRows = async (
  options: TFetchRowsOptions
): Promise<
  Array<{
    id: string; // v3 uses lowercase 'id'
    [key: string]: unknown;
  }>
> => {
  const { token, table, url, baseId, where } = options;
  const limit = 100;

  try {
    const queryParams: Record<string, string> = {
      limit: String(limit),
      // v3 API requires sort as JSON string: [{"field": "fieldId", "direction": "asc|desc"}]
      sort: JSON.stringify([{ field: 'CreatedAt', direction: 'desc' }]),
    };

    if (where) {
      queryParams.where = where;
    }

    // v3 API endpoint: /api/v3/data/{baseId}/{tableId}/records
    const response = await nocodbClient.get<NocoDBV3Response>(`data/${baseId}/${table}/records`, {
      token,
      connectionOptions: { url },
      params: queryParams,
    });

    // v3 response format: { records: [{ id, fields }] }
    const records = fromV3Response(response?.records || []);
    return records as Array<{ id: string; [key: string]: unknown }>;
  } catch (error) {
    throw new NocoDBError(
      `Failed to fetch latest rows: ${error instanceof Error ? error.message : error}`
    );
  }
};
