import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { MAUTIC_CONN_OPTIONS } from '../constants';
import { mauticClient } from '../client';
import { TMauticCampaign } from '../response-types';

const mapMauticCampaignToAllowedValue = (item: TMauticCampaign): IQoreAllowedValue<number> => {
  return {
    value: item.id,
    display_name: item.name,
    desc: item.description || `Campaign ID: ${item.id}`,
  };
};

export const getMauticCampaignsAllowedValues: TQoreGetAllowedValuesFunction<
  typeof MAUTIC_CONN_OPTIONS,
  number
> = async (context) => {
  const { instance_url, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['instance_url', 'username', 'password'],
  });

  return await mauticClient.fetchAllowedValues<TMauticCampaign>({
    path: 'campaigns',
    connectionOptions: { instance_url, username, password },
    itemsPath: 'campaigns',
    mapItemToAllowedValue: mapMauticCampaignToAllowedValue,
  });
};
