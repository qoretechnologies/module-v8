import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AIRTABLE_APP_NAME, AirtableError } from '../constants';
import { createAirtableClient } from '../helpers/constants';
import { getAirtableBaseIdAllowedValues } from '../helpers/get-base-id-allowed-values';
import { getAirtableRecordResponseType } from '../helpers/get-record-type';
import { getAirtableTableFieldsAllowedValues } from '../helpers/get-table-fields-allowed-values';
import { getAirtableTableIdAllowedValues } from '../helpers/get-table-id-allowed-values';
import { AirtableTimezoneAllowedValues } from '../helpers/get-timezone-allowed-values';
import { getAirtableViewsAllowedValues } from '../helpers/get-view-id-allowed-values';

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
  fields: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getAirtableTableFieldsAllowedValues,
    depends_on: ['base_id', 'table_id'],
  },
  page_size: {
    type: 'integer',
    required: false,
    default_value: 100,
  },
  offset: {
    type: 'integer',
    required: false,
  },
  timezone: {
    type: 'string',
    required: false,
    allowed_values: AirtableTimezoneAllowedValues,
  },
  user_locale: {
    type: 'string',
    required: false,
  },
  sort: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          get_allowed_values: getAirtableTableFieldsAllowedValues,
        },
        direction: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'asc', display_name: 'Ascending' },
            { value: 'desc', display_name: 'Descending' },
          ],
        },
      },
    },
  },
  cell_format: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'json', display_name: 'JSON' },
      { value: 'string', display_name: 'String' },
    ],
  },
  filter: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required_groups: ['records_filter'],
          get_allowed_values: getAirtableTableFieldsAllowedValues,
        },
        value: { type: 'string', required_groups: ['records_filter'] },
        type: {
          type: 'string',
          required: false,
          allowed_values: [
            { value: 'contains', display_name: 'Contains' },
            { value: 'equals', display_name: 'Equals' },
          ],
        },
        formula: { type: 'string', required_groups: ['records_filter'] },
      },
    },
  },
  return_fields_by_field_id: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  view: {
    type: 'string',
    required: false,
    get_allowed_values: getAirtableViewsAllowedValues,
    depends_on: ['base_id', 'table_id'],
  },
} satisfies TQoreOptions;

const listRecords = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AIRTABLE_APP_NAME,
  action: 'list_records',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, base_id, table_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['base_id', 'table_id'],
      ErrorClass: AirtableError,
    });

    const fields = obj?.fields;
    const pageSize = obj?.page_size || 100;
    const offset = obj?.offset;
    const timeZone = obj?.timezone || 'utc';
    const userLocale = obj?.user_locale || 'en-US';
    const sort = obj?.sort;
    const cellFormat = obj?.cell_format || 'json';
    const returnFieldsByFieldId = obj?.return_fields_by_field_id || false;
    const view = obj?.view;
    const filter = obj?.filter;
    let filterByFormula: string | undefined;

    if (filter?.formula) {
      filterByFormula = filter.formula;
    } else if (filter?.field && filter?.value) {
      const filterType = filter.type || 'equals';

      if (filterType === 'contains') {
        filterByFormula = `FIND('${filter.value}', {${filter.field}})`;
      } else if (filterType === 'equals') {
        filterByFormula = `{${filter.field}} = '${filter.value}'`;
      }
    }

    const client = createAirtableClient(token).base(base_id).table(table_id);

    const records: any[] = [];

    try {
      await client
        .select({
          ...(filterByFormula && { filterByFormula }),
          ...(sort && { sort: [sort] }),
          ...(fields && { fields }),
          ...(offset && { offset }),
          ...(view && { view }),
          timeZone,
          pageSize,
          userLocale,
          cellFormat,
          returnFieldsByFieldId,
        })
        .eachPage((pageRecords, fetchNextPage) => {
          records.push(...pageRecords.map((record) => omit(record, ['_table', '_rawJson'])));
          fetchNextPage();
        });
    } catch (error) {
      throw new AirtableError(`Failed to list records: ${error.message || error}`);
    }

    return JSON.parse(JSON.stringify(records));
  },
  response_type: {
    type: 'list',
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
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          fields: {
            type: fieldsType,
          },
        },
      },
    };
  },
});

export default listRecords;
