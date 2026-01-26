import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { GetSegmentListResponseCollectionCompoundDocumentDataInner } from 'klaviyo-api';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KlaviyoError } from '../constants';
import { getKlaviyoApis } from './constants';

const mapKlaviyoItemToAllowedValue = (
  item: GetSegmentListResponseCollectionCompoundDocumentDataInner
): IQoreAllowedValue<string> => {
  return {
    value: item.id!,
    display_name: item.attributes.name || 'Unknown Segment',
  };
};

export const getKlaviyoSegmentIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: KlaviyoError,
  });

  const { segmentsApi } = getKlaviyoApis(token);

  const items: GetSegmentListResponseCollectionCompoundDocumentDataInner[] = [];
  let pageCursor = undefined;

  try {
    do {
      const response = await segmentsApi.getSegments({
        ...(pageCursor && { pageCursor }),
      });

      items.push(...response.body.data);
      pageCursor = response.body.links?.next;
    } while (pageCursor);
  } catch (error) {
    console.error(`Failed to fetch segments: ${error}`);
  }

  return items.map(mapKlaviyoItemToAllowedValue);
};
