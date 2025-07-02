import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AIRTABLE_APP_NAME, AirtableError } from '../constants';

type Table = {
  id: string;
  name: string;
};

const mapAirtableItemToAllowedValue = (item: Table): IQoreAllowedValue<string> => ({
  value: item.id!,
  display_name: item.name,
});

export const getAirtableTableIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, base_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['base_id'],
    ErrorClass: AirtableError,
  });

  const items: IQoreAllowedValue<string>[] = [];

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

    items.push(
      ...(response?.data.tables || []).map((table) => mapAirtableItemToAllowedValue(table))
    );
  } catch (error) {
    console.error(`Failed to fetch tables: ${error}`);
  }

  return items;
};
