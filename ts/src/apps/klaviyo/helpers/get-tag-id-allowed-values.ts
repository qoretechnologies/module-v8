import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { GetTagResponseCollectionCompoundDocumentDataInner } from 'klaviyo-api';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KlaviyoError } from '../constants';
import { getKlaviyoApis } from './constants';

const mapKlaviyoItemToAllowedValue = (
  item: GetTagResponseCollectionCompoundDocumentDataInner
): IQoreAllowedValue<string> => {
  return {
    value: item.id!,
    display_name: item.attributes.name || 'Unknown Tag',
  };
};

export const getKlaviyoTagIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: KlaviyoError,
  });

  const { tagsApi } = getKlaviyoApis(token);

  const items: GetTagResponseCollectionCompoundDocumentDataInner[] = [];
  let pageCursor = undefined;

  try {
    do {
      const response = await tagsApi.getTags({
        ...(pageCursor && { pageCursor }),
      });

      items.push(...response.body.data);
      pageCursor = response.body.links?.next;
    } while (pageCursor);
  } catch (error) {
    console.error(`Failed to fetch tags: ${error}`);
  }

  return items.map(mapKlaviyoItemToAllowedValue);
};
