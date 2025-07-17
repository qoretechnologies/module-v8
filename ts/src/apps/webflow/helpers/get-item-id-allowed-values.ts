import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { CollectionItem } from 'webflow-api/api';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { WebflowError } from '../constants';
import { createWebflowClient } from './constants';

const WEBFLOW_ALLOWED_ITEMS_LIMIT = 500;

const mapWebflowItemToAllowedValue = (item: CollectionItem): IQoreAllowedValue<string> => ({
  value: item.id!,
  display_name: item.fieldData?.name || item.fieldData?.slug || 'Untitled',
  desc: `Is Archived: ${item.isArchived}\nIs Draft: ${item.isDraft}`,
});

export const getWebflowItemAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, collection } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['collection'],
    ErrorClass: WebflowError,
  });

  const client = createWebflowClient(token);

  const items: CollectionItem[] = [];

  try {
    let total = 0;
    let offset = 0;

    do {
      const response = await client.collections.items.listItems(collection, {
        sortBy: 'lastPublished',
        limit: 100,
        sortOrder: 'desc',
        offset,
      });

      if (response.items) {
        items.push(...response.items);
        total = response.pagination?.total || 0;
      }

      offset += 100;
    } while (items.length < total && items.length < WEBFLOW_ALLOWED_ITEMS_LIMIT);
  } catch (error) {
    console.error(`Failed to fetch items: ${error}`);
  }

  return items.map(mapWebflowItemToAllowedValue);
};
