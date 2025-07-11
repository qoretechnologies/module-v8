import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { GetListListResponseCollectionCompoundDocumentDataInner } from 'klaviyo-api';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KlaviyoError } from '../constants';
import { getKlaviyoApis } from './constants';

const mapKlaviyoItemToAllowedValue = (
  item: GetListListResponseCollectionCompoundDocumentDataInner
): IQoreAllowedValue<string> => {
  return {
    value: item.id!,
    display_name: item.attributes.name || 'Unknown List',
  };
};

export const getKlaviyoListIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: KlaviyoError,
  });

  const { listsApi } = getKlaviyoApis(token);

  const items: GetListListResponseCollectionCompoundDocumentDataInner[] = [];
  let pageCursor = undefined;

  try {
    do {
      const response = await listsApi.getLists({
        ...(pageCursor && { pageCursor }),
      });

      items.push(...response.body.data);
      pageCursor = response.body.links?.next;
    } while (pageCursor);
  } catch (error) {
    console.error(`Failed to fetch lists: ${error}`);
  }

  return items.map(mapKlaviyoItemToAllowedValue);
};
