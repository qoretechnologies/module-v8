import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_CONN_OPTIONS } from '../constants';
import { fetchActiveCampaignAllowedValues } from './constants';
type ActiveCampaignItem = {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
};

const mapActiveCampaignItemToAllowedValue = (
  item: ActiveCampaignItem
): IQoreAllowedValue<string> => {
  const fullName = `${item.first_name} ${item.last_name}`.trim() || item.email;

  return {
    value: item.id,
    display_name: fullName,
    desc: `Email: ${item.email}\nName: ${fullName}\nPhone: ${item.phone}`,
  };
};

export const getActiveCampaignContactAllowedValues: TQoreGetAllowedValuesFunction<
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
    path: 'contacts',
    object: 'contacts',
    mapItemToAllowedValue: mapActiveCampaignItemToAllowedValue,
  });
};
