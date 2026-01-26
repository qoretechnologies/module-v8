import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_CONN_OPTIONS } from '../constants';
import { activeCampaignClient } from './constants';

type ActiveCampaignItem = {
  id: string;
  name: string;
};

const mapActiveCampaignItemToAllowedValue = (
  item: ActiveCampaignItem
): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
  };
};

export const getActiveCampaignAccountAllowedValues: TQoreGetAllowedValuesFunction<
  typeof ACTIVE_CAMPAIGN_CONN_OPTIONS,
  string
> = async (context) => {
  const { token, instance_url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_url'],
  });

  return await activeCampaignClient.fetchAllowedValues<ActiveCampaignItem>({
    path: 'accounts',
    token,
    baseUrl: instance_url,
    itemsPath: 'accounts',
    mapItemToAllowedValue: mapActiveCampaignItemToAllowedValue,
  });
};
