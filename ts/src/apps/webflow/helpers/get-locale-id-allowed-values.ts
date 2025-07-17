import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Locale } from 'webflow-api/api';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { WebflowError } from '../constants';
import { createWebflowClient } from './constants';

const mapWebflowItemToAllowedValue = (
  item: Locale & { primary: boolean }
): IQoreAllowedValue<string> => ({
  value: item.cmsLocaleId!,
  display_name: item.displayName,
  desc: `Enabled: ${item.enabled}]\nTag: ${item.tag}\nPrimary: ${item.primary || false}`,
});

export const getWebflowCmsLocaleIdAllowedValues: TQoreGetAllowedValuesFunction<
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

  const items: (Locale & { primary?: boolean })[] = [];

  try {
    const response = await client.sites.get(site);

    if (response?.locales) {
      if (response?.locales.primary) items.push({ ...response.locales.primary, primary: true });
      if (response?.locales.secondary) items.push(...response.locales.secondary);
    }
  } catch (error) {
    console.error(`Failed to fetch locales: ${error}`);
  }

  return items.map(mapWebflowItemToAllowedValue);
};
