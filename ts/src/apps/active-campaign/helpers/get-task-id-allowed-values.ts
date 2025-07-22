import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_CONN_OPTIONS } from '../constants';
import { fetchActiveCampaignAllowedValues } from './constants';
type ActiveCampaignItem = {
  id: string;
  title: string;
  note: string;
};

const mapActiveCampaignItemToAllowedValue = (
  item: ActiveCampaignItem
): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.title,
    desc: `Note: ${item.note}`,
  };
};

export const getActiveCampaignTaskAllowedValues: TQoreGetAllowedValuesFunction<
  typeof ACTIVE_CAMPAIGN_CONN_OPTIONS,
  string
> = async (context) => {
  const { token, instance_url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_url'],
  });

  return await fetchActiveCampaignAllowedValues<ActiveCampaignItem>({
    token,
    url: instance_url,
    path: 'dealTasks',
    object: 'dealTasks',
    mapItemToAllowedValue: mapActiveCampaignItemToAllowedValue,
  });
};
