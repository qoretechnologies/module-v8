import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AIRTABLE_APP_NAME, AirtableError } from '../constants';
import { createAirtableClient } from '../helpers/constants';
import { getAirtableBaseIdAllowedValues } from '../helpers/get-base-id-allowed-values';
import { getAirtableRecordAllowedValues } from '../helpers/get-record-id-allowed-values';
import { getAirtableTableIdAllowedValues } from '../helpers/get-table-id-allowed-values';
import { omit } from 'lodash';
import { getAirtableRecordResponseType } from '../helpers/get-record-type';

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

const getRecord = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AIRTABLE_APP_NAME,
  action: 'get_record',
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
      const record = await client.find(record_id);

      return omit(record, ['_table', '_rawJson']);
    } catch (error) {
      throw new AirtableError(`Failed to get record: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
  },
  get_dynamic_response_type: async (context) => {
    const { base_id, table_id, token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['base_id', 'table_id'],
      ErrorClass: AirtableError,
    });

    const fieldsType = await getAirtableRecordResponseType({
      base_id,
      table_id,
      token,
    });

    return {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        fields: {
          type: fieldsType,
        },
      },
    };
  },
});

export default getRecord;
