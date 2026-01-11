import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { MAUTIC_CONN_OPTIONS } from '../constants';
import { mauticClient } from '../client';
import { TMauticContact } from '../response-types';

const mapMauticContactToAllowedValue = (item: TMauticContact): IQoreAllowedValue<number> => {
  const email = item.fields?.all?.email as string || '';
  const firstName = item.fields?.all?.firstname as string || '';
  const lastName = item.fields?.all?.lastname as string || '';
  const fullName = firstName || lastName ? `${firstName} ${lastName}`.trim() : email;

  return {
    value: item.id,
    display_name: fullName || `Contact ${item.id}`,
    desc: email ? `Email: ${email}` : `ID: ${item.id}`,
  };
};

export const getMauticContactsAllowedValues: TQoreGetAllowedValuesFunction<
  typeof MAUTIC_CONN_OPTIONS,
  number
> = async (context) => {
  const { instance_url, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['instance_url', 'username', 'password'],
  });

  return await mauticClient.fetchAllowedValues<TMauticContact>({
    path: 'contacts',
    connectionOptions: { instance_url, username, password },
    itemsPath: 'contacts',
    mapItemToAllowedValue: mapMauticContactToAllowedValue,
  });
};
