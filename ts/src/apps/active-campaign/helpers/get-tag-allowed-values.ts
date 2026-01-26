import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_CONN_OPTIONS, ActiveCampaignError } from '../constants';
import { activeCampaignClient } from './constants';
type ActiveCampaignItem = {
  id: string;
  tag: string;
  description: string;
};

const mapActiveCampaignItemToAllowedValue = (
  item: ActiveCampaignItem
): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.tag,
    desc: `Description: ${item.description}`,
  };
};

const mapActiveCampaignContactTagToAllowedValue =
  (allTags: IQoreAllowedValue<string>[]) =>
  (item: { tag: string; id: string }): IQoreAllowedValue<string> => {
    return {
      value: item.id,
      display_name: allTags.find((tag) => tag.value === item.id)?.display_name || item.tag,
    };
  };

export const getActiveCampaignTagAllowedValues: TQoreGetAllowedValuesFunction<
  typeof ACTIVE_CAMPAIGN_CONN_OPTIONS,
  string
> = async (context) => {
  const { token, instance_url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_url'],
  });

  return await activeCampaignClient.fetchAllowedValues<ActiveCampaignItem>({
    path: 'tags',
    token,
    baseUrl: instance_url,
    itemsPath: 'tags',
    mapItemToAllowedValue: mapActiveCampaignItemToAllowedValue,
  });
};

export const getActiveCampaignContactTagAllowedValues: TQoreGetAllowedValuesFunction<
  typeof ACTIVE_CAMPAIGN_CONN_OPTIONS,
  string
> = async (context) => {
  const { token, instance_url, contact } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_url'],
    optionFields: ['contact'],
    ErrorClass: ActiveCampaignError,
  });

  const allTags = await getActiveCampaignTagAllowedValues(context);

  return await activeCampaignClient.fetchAllowedValues<ActiveCampaignItem>({
    path: `contacts/${contact}/contactTags`,
    token,
    baseUrl: instance_url,
    itemsPath: 'contactTags',
    mapItemToAllowedValue: mapActiveCampaignContactTagToAllowedValue(allTags),
  });
};
