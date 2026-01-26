import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { CollectionListArrayItem } from 'webflow-api/api';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { WebflowError } from '../constants';
import { createWebflowClient } from './constants';

const mapWebflowItemToAllowedValue = (
  item: CollectionListArrayItem
): IQoreAllowedValue<string> => ({
  value: item.id!,
  display_name: item.displayName,
  desc: `Slug: ${item.slug}, Created on: ${item.createdOn || 'N/A'}`,
});

export const getWebflowCollectionAllowedValues: TQoreGetAllowedValuesFunction<
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

  const items: CollectionListArrayItem[] = [];

  try {
    const response = await client.collections.list(site);

    if (response.collections) {
      items.push(...response.collections);
    }
  } catch (error) {
    console.error(`Failed to fetch collections: ${error}`);
  }

  return items.map(mapWebflowItemToAllowedValue);
};
