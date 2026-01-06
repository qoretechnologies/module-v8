import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_CONN_OPTIONS } from '../constants';
import { activeCampaignClient } from './constants';
type ActiveCampaignItem = {
  id: string;
  title: string;
  value: string;
  currency: string;
  winProbability: number;
};

const mapActiveCampaignItemToAllowedValue = (
  item: ActiveCampaignItem
): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.title,
    desc: `Value: ${item.value} ${item.currency}\nWin Probability: ${item.winProbability}%`,
  };
};

export const getActiveCampaignDealAllowedValues: TQoreGetAllowedValuesFunction<
  typeof ACTIVE_CAMPAIGN_CONN_OPTIONS,
  string
> = async (context) => {
  const { token, instance_url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_url'],
  });

  return await activeCampaignClient.fetchAllowedValues<ActiveCampaignItem>({
    path: 'deals',
    token,
    baseUrl: instance_url,
    itemsPath: 'deals',
    mapItemToAllowedValue: mapActiveCampaignItemToAllowedValue,
  });
};
