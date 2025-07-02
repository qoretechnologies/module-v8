import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AIRTABLE_APP_NAME, AirtableError } from '../constants';

type Base = {
  id: string;
  name: string;
  permissionLevel: string;
};

const mapAirtableItemToAllowedValue = (item: Base): IQoreAllowedValue<string> => ({
  value: item.id!,
  display_name: item.name,
  desc: `Permission Level: ${item.permissionLevel}`,
});

export const getAirtableBaseIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: AirtableError,
  });

  const items: IQoreAllowedValue<string>[] = [];

  try {
    const response = await QorusRequest.get<{ data: { bases: Base[] } }>(
      {
        path: '/v0/meta/bases',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      {
        url: 'https://api.airtable.com',
        endpointId: AIRTABLE_APP_NAME,
      }
    );

    items.push(...(response?.data.bases || []).map((base) => mapAirtableItemToAllowedValue(base)));
  } catch (error) {
    console.error(`Failed to fetch bases: ${error}`);
  }

  return items;
};
