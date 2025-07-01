import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AIRTABLE_APP_NAME, AirtableError } from '../constants';

type Field = {
  id: string;
  name: string;
  type: string;
};

type Table = {
  id: string;
  name: string;
  fields: Field[];
};

const mapAirtableFieldToAllowedValue = (field: Field): IQoreAllowedValue<string> => ({
  value: field.id,
  display_name: field.name,
  short_desc: field.type,
});

export const getAirtableTableFieldsAllowedValues: TQoreGetAllowedValuesFunction<
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

    return table.fields.map(mapAirtableFieldToAllowedValue);
  } catch (error) {
    throw new AirtableError(`Failed to fetch table fields: ${error.message || error}`);
  }
};
