import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { activeCampaignClient } from './constants';
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
  const firstName = item.first_name;
  const lastName = item.last_name;
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : item.email;

  return {
    value: item.id,
    display_name: fullName,
    desc: `Email: ${item.email}\nName: ${fullName}\nPhone: ${item.phone}`,
  };
};

export const getActiveCampaignContactAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_url'],
  });

  return await activeCampaignClient.fetchAllowedValues<ActiveCampaignItem>({
    path: 'contacts',
    token,
    baseUrl: instance_url,
    itemsPath: 'contacts',
    mapItemToAllowedValue: mapActiveCampaignItemToAllowedValue,
  });
};
