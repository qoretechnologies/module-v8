import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AIRTABLE_APP_NAME, AirtableError } from '../constants';
import { createAirtableClient } from '../helpers/constants';
import { getAirtableBaseIdAllowedValues } from '../helpers/get-base-id-allowed-values';
import {
  getAirtableRecordCreateOptions,
  getAirtableRecordResponseType,
} from '../helpers/get-record-type';
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
    get_dependent_options: async (context) => {
      const { base_id, token, table_id } = getQoreContextRequiredValues({
        context,
        connectionFields: ['token'],
        optionFields: ['base_id', 'table_id'],
        ErrorClass: AirtableError,
      });

      return await getAirtableRecordCreateOptions({
        base_id,
        table_id,
        token,
        set_primary_required: true,
      });
    },
  },
} satisfies TQoreOptions;

const createRecord = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AIRTABLE_APP_NAME,
  action: 'create_record',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, base_id, table_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['base_id', 'table_id'],
      ErrorClass: AirtableError,
    });

    const otherOptions = omit(obj, ['base_id', 'table_id']);

    const client = createAirtableClient(token).base(base_id).table(table_id);

    try {
      const record = await client.create(otherOptions);

      return record;
    } catch (error) {
      throw new AirtableError(`Failed to create record: ${error.message || error}`);
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

export default createRecord;
