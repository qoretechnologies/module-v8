import {
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AIRTABLE_APP_NAME, AirtableError } from '../constants';
import { createAirtableClient } from './constants';

type Field = {
  id: string;
  name: string;
  type: string;
};

type Table = {
  id: string;
  name: string;
  fields: Field[];
  primaryFieldId: string;
};

export const getAirtableRecordAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, base_id, table_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['base_id', 'table_id'],
    ErrorClass: AirtableError,
  });

  try {
    const response = await QorusRequest.get<{ data: { tables: Table[] } }>(
      {
        path: `/v0/meta/bases/${base_id}/tables`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      {
        url: 'https://api.airtable.com',
        endpointId: AIRTABLE_APP_NAME,
      }
    );

    const table = response?.data?.tables?.find((t: Table) => t.id === table_id);

    if (!table) {
      throw new AirtableError(`Table with ID ${table_id} not found`);
    }

    const primaryField = table.primaryFieldId;

    const client = createAirtableClient(token).base(base_id).table(table_id);

    const records: any[] = [];

    await client
      .select({
        returnFieldsByFieldId: true,
        fields: [primaryField],
        maxRecords: 500,
      })
      .eachPage((pageRecords, fetchNextPage) => {
        records.push(...pageRecords);
        fetchNextPage();
      });

    return records.map((record) => ({
      value: record.id,
      display_name: record.fields[primaryField] || 'No Name',
    }));
  } catch (error) {
    throw new AirtableError(`Failed to fetch table records: ${error.message || error}`);
  }
};
