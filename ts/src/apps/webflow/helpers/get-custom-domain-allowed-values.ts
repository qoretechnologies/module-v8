import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Domain, Site } from 'webflow-api/api';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { WebflowError } from '../constants';
import { createWebflowClient } from './constants';

const mapWebflowItemToAllowedValue = (item: Domain): IQoreAllowedValue<string> => ({
  value: item.id!,
  display_name: item.url,
});

export const getWebflowCustomDomainAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, site } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['site'],
    ErrorClass: WebflowError,
  });

  const client = createWebflowClient(token);

  const items: Site[] = [];

  try {
    const response = await client.sites.getCustomDomain(site);

    if (response.customDomains) {
      items.push(...response.customDomains);
    }
  } catch (error) {
    console.error(`Failed to fetch custom domains: ${error}`);
  }

  return items.map(mapWebflowItemToAllowedValue);
};
