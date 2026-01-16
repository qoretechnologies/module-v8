import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { nocodbClient } from '../client';
import { NOCODB_APP_NAME, NocoDBError } from '../constants';
import { getNocoDBBaseAllowedValues } from '../helpers/get-base-allowed-values';
import { getNocoDBLinkFieldAllowedValues } from '../helpers/get-link-field-allowed-values';
import { getNocoDBRecordAllowedValues } from '../helpers/get-record-allowed-values';
import { getNocoDBTableIdAllowedValues } from '../helpers/get-table-allowed-values';
import { getNocoDBWorkspaceAllowedValues } from '../helpers/get-workspace-allowed-values';

const action = 'link_records';

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
    on_change: ['refetch'],
  },
  linkField: {
    type: 'string',
    required: true,
    get_allowed_values: getNocoDBLinkFieldAllowedValues,
  },
  recordId: {
    type: 'string',
    required: true,
    get_allowed_values: getNocoDBRecordAllowedValues,
  },
  linkedRecordIds: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: true,
  },
} satisfies TQoreOptions;

type TLinkResponse = {
  success: boolean;
};

const LinkRecords = QoreAppCreator.createLocalizedAction<typeof options>({
  app: NOCODB_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
    },
  },
  api_function: async (obj, _opts, context) => {
    const { token, url, baseId, table, linkField, recordId, linkedRecordIds } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['token', 'url'],
        optionFields: ['baseId', 'table', 'linkField', 'recordId', 'linkedRecordIds'],
        ErrorClass: NocoDBError,
      });

    const recordIdsToLink = linkedRecordIds as string[];

    if (!recordIdsToLink || recordIdsToLink.length === 0) {
      throw new NocoDBError('At least one record ID must be provided to link');
    }

    try {
      // v3 API endpoint: POST /api/v3/data/{baseId}/{tableId}/links/{linkFieldId}/{recordId}
      // Request body: array of { id: recordId } objects
      const requestBody = recordIdsToLink.map((id) => ({ id: String(id) }));

      const response = await nocodbClient.post<TLinkResponse>(
        `data/${baseId}/${table}/links/${linkField}/${recordId}`,
        requestBody,
        {
          token,
          connectionOptions: { url },
        }
      );

      return { success: response?.success ?? true };
    } catch (error) {
      if (error instanceof NocoDBError) {
        throw error;
      }
      throw new NocoDBError(
        `Failed to link records: ${error instanceof Error ? error.message : error}`
      );
    }
  },
});

export default LinkRecords;
