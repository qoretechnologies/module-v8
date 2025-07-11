import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { GetProfileResponseCollectionCompoundDocumentDataInner } from 'klaviyo-api';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KlaviyoError } from '../constants';
import { getKlaviyoApis } from './constants';

const mapKlaviyoItemToAllowedValue = (
  item: GetProfileResponseCollectionCompoundDocumentDataInner
): IQoreAllowedValue<string> => {
  const firstName = item.attributes.firstName || '';
  const lastName = item.attributes.lastName || '';
  const email = item.attributes.email || '';

  return {
    value: item.id!,
    display_name: `${email} ${firstName} ${lastName}`,
  };
};

export const getKlaviyoProfileIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: KlaviyoError,
  });

  const { profilesApi } = getKlaviyoApis(token);

  const items: GetProfileResponseCollectionCompoundDocumentDataInner[] = [];
  let pageCursor = undefined;

  try {
    do {
      const response = await profilesApi.getProfiles({
        ...(pageCursor && { pageCursor }),
      });

      items.push(...response.body.data);
      pageCursor = response.body.links?.next;
    } while (pageCursor);
  } catch (error) {
    console.error(`Failed to fetch profiles: ${error}`);
  }

  return items.map(mapKlaviyoItemToAllowedValue);
};
