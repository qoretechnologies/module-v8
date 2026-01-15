import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { fromV3Response, nocodbClient, NocoDBV3Record } from '../client';
import { NOCODB_APP_NAME, NocoDBError } from '../constants';
import { getNocoDBWorkspaceAllowedValues } from '../helpers/get-workspace-allowed-values';
import { getNocoDBBaseAllowedValues } from '../helpers/get-base-allowed-values';
import { getNocoDBTableAllowedValues } from '../helpers/get-table-allowed-values';
import { getNocoDBButtonFieldAllowedValues } from '../helpers/get-button-field-allowed-values';
import { getNocoDBTableIdByName } from '../helpers/record-based/constants';
import { getNocoDBTableColumnsResponseType } from '../helpers/get-table-columns';

const action = 'trigger_button';

const MAX_RECORDS = 25;

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
    get_allowed_values: getNocoDBTableAllowedValues,
    on_change: ['refetch'],
  },
  buttonField: {
    type: 'string',
    required: true,
    get_allowed_values: getNocoDBButtonFieldAllowedValues,
  },
  recordIds: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: true,
  },
  preview: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const TriggerButton = QoreAppCreator.createLocalizedAction<typeof options>({
  app: NOCODB_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        fields: { type: 'any' },
      },
    },
  },
  get_dynamic_response_type: async (context) => {
    const recordType = await getNocoDBTableColumnsResponseType(context);
    return {
      type: 'list',
      element_type: recordType,
    };
  },
  api_function: async (obj, _opts, context) => {
    const { token, url, baseId, table, buttonField, recordIds } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'url'],
      optionFields: ['baseId', 'table', 'buttonField', 'recordIds'],
      ErrorClass: NocoDBError,
    });

    const preview = (obj?.preview as boolean) ?? false;
    const rowIds = recordIds as string[];

    if (!rowIds || rowIds.length === 0) {
      throw new NocoDBError('At least one record ID must be provided');
    }

    if (rowIds.length > MAX_RECORDS) {
      throw new NocoDBError(`Maximum of ${MAX_RECORDS} records can be processed at a time`);
    }

    try {
      // Convert table name to table ID
      const tableId = await getNocoDBTableIdByName({ token, url, baseId, tableName: table });

      // v3 API endpoint: POST /api/v3/data/{baseId}/{tableId}/actions/{columnId}
      // Request body: { rowIds: string[], preview?: boolean }
      const response = await nocodbClient.post<NocoDBV3Record[]>(
        `data/${baseId}/${tableId}/actions/${buttonField}`,
        {
          rowIds: rowIds.map(String),
          preview: Boolean(preview),
        },
        {
          token,
          connectionOptions: { url },
        }
      );

      // Transform v3 response format
      if (response && Array.isArray(response)) {
        return fromV3Response(response);
      }

      return [];
    } catch (error) {
      if (error instanceof NocoDBError) {
        throw error;
      }
      throw new NocoDBError(`Failed to trigger button action: ${error instanceof Error ? error.message : error}`);
    }
  },
});

export default TriggerButton;
