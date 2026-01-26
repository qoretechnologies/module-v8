import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AIRTABLE_APP_NAME, AirtableError } from '../constants';
import { createAirtableClient } from '../helpers/constants';
import { getAirtableBaseIdAllowedValues } from '../helpers/get-base-id-allowed-values';
import { getAirtableRecordAllowedValues } from '../helpers/get-record-id-allowed-values';
import { getAirtableTableIdAllowedValues } from '../helpers/get-table-id-allowed-values';

const options = {
  base_id: {
    type: 'string',
    required: true,
    get_allowed_values: getAirtableBaseIdAllowedValues,
    on_change: ['refetch'],
  },
  table_id: {
    type: 'string',
    required: true,
    depends_on: ['base_id'],
    get_allowed_values: getAirtableTableIdAllowedValues,
    on_change: ['refetch'],
  },
  record_id: {
    type: 'string',
    required: true,
    get_allowed_values: getAirtableRecordAllowedValues,
    allowed_values_creatable: true,
    depends_on: ['base_id', 'table_id'],
  },
} satisfies TQoreOptions;

const deleteRecord = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AIRTABLE_APP_NAME,
  action: 'delete_record',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, base_id, table_id, record_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['base_id', 'table_id', 'record_id'],
      ErrorClass: AirtableError,
    });

    const client = createAirtableClient(token).base(base_id).table(table_id);

    try {
      const record = await client.destroy(record_id);

      return {
        success: true,
        id: record.id,
      };
    } catch (error) {
      throw new AirtableError(`Failed to delete record: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      id: { type: 'string' },
    },
  },
});

export default deleteRecord;
