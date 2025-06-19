import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooUtmCampaignFields = ['id', 'display_name', 'title'] as const;

type TOdooUtmCampaign = { id: number } & {
  [K in (typeof OdooUtmCampaignFields)[number]]: string;
};

const mapOdooUtmCampaignToAllowedValue = (
  campaign: TOdooUtmCampaign
): IQoreAllowedValue<number> => ({
  value: campaign.id,
  display_name: campaign.display_name,
  short_desc: `Title: ${campaign.title}`,
});

export const getOdooUtmCampaignIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  return await fetchOdooAllowedValues<TOdooUtmCampaign>({
    subdomain,
    username,
    password,
    model: 'utm.campaign',
    fields: [...OdooUtmCampaignFields],
    mapItemToAllowedValue: mapOdooUtmCampaignToAllowedValue,
  });
};
