import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { GetEventResponseCollectionCompoundDocumentDataInner } from 'klaviyo-api';
import { formatDateReadable, getQoreContextRequiredValues } from '../../../global/helpers';
import { KlaviyoError } from '../constants';
import { getKlaviyoApis } from './constants';

const mapKlaviyoItemToAllowedValue = (
  item: GetEventResponseCollectionCompoundDocumentDataInner
): IQoreAllowedValue<string> => {
  return {
    value: item.id!,
    display_name: item.attributes.datetime
      ? formatDateReadable(item.attributes.datetime.toISOString())
      : 'Unknown Event',
  };
};

export const getKlaviyoEventIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: KlaviyoError,
  });

  const { eventsApi } = getKlaviyoApis(token);

  const items: GetEventResponseCollectionCompoundDocumentDataInner[] = [];
  let pageCursor = undefined;

  try {
    do {
      const response = await eventsApi.getEvents({
        ...(pageCursor && { pageCursor }),
      });

      items.push(...response.body.data);
      pageCursor = response.body.links?.next;
    } while (pageCursor);
  } catch (error) {
    console.error(`Failed to fetch events: ${error}`);
  }

  return items.map(mapKlaviyoItemToAllowedValue);
};
