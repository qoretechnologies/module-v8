import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { MAUTIC_CONN_OPTIONS } from '../constants';
import { mauticClient } from '../client';
import { TMauticEmail } from '../response-types';

const mapMauticEmailToAllowedValue = (item: TMauticEmail): IQoreAllowedValue<number> => {
  return {
    value: item.id,
    display_name: item.name,
    desc: `Subject: ${item.subject || 'N/A'} | Type: ${item.emailType}`,
  };
};

export const getMauticEmailsAllowedValues: TQoreGetAllowedValuesFunction<
  typeof MAUTIC_CONN_OPTIONS,
  number
> = async (context) => {
  const { instance_url, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['instance_url', 'username', 'password'],
  });

  return await mauticClient.fetchAllowedValues<TMauticEmail>({
    path: 'emails',
    connectionOptions: { instance_url, username, password },
    itemsPath: 'emails',
    mapItemToAllowedValue: mapMauticEmailToAllowedValue,
  });
};

export const getSegmentEmailsAllowedValues: TQoreGetAllowedValuesFunction<
  typeof MAUTIC_CONN_OPTIONS,
  number
> = async (context) => {
  const { instance_url, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['instance_url', 'username', 'password'],
  });

  return await mauticClient.fetchAllowedValues<TMauticEmail>({
    path: 'emails',
    connectionOptions: { instance_url, username, password },
    itemsPath: 'emails',
    mapItemToAllowedValue: mapMauticEmailToAllowedValue,
    filterItems: (item: TMauticEmail) => item.emailType === 'list',
  });
};
