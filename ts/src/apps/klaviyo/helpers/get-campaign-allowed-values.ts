import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { GetCampaignResponseCollectionCompoundDocumentDataInner } from 'klaviyo-api';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KlaviyoError } from '../constants';
import { getKlaviyoApis } from './constants';

const mapKlaviyoItemToAllowedValue = (
  item: GetCampaignResponseCollectionCompoundDocumentDataInner
): IQoreAllowedValue<string> => {
  const name = item.attributes.name || '';

  return {
    value: item.id!,
    display_name: `${name}`,
    desc: `Status: ${item.attributes.status}`,
  };
};

export const getKlaviyoCampaignIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const [smsCampaigns, emailCampaigns] = await Promise.all([
      getKlaviyoSmsCampaignIdAllowedValues(context),
      getKlaviyoEmailCampaignIdAllowedValues(context),
    ]);

    return [...smsCampaigns, ...emailCampaigns];
  } catch (error) {
    console.error(`Failed to fetch campaigns: ${error}`);

    return [];
  }
};

export const getKlaviyoEmailCampaignIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: KlaviyoError,
  });

  const { campaignsApi } = getKlaviyoApis(token);

  const items: GetCampaignResponseCollectionCompoundDocumentDataInner[] = [];
  let pageCursor = undefined;

  try {
    do {
      const response = await campaignsApi.getCampaigns('equals(messages.channel,"email")', {
        ...(pageCursor && { pageCursor }),
      });

      items.push(...response.body.data);
      pageCursor = response.body.links?.next;
    } while (pageCursor);

    pageCursor = undefined;
  } catch (error) {
    console.error(`Failed to fetch campaigns: ${error}`);
  }

  return items.map(mapKlaviyoItemToAllowedValue);
};

export const getKlaviyoSmsCampaignIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: KlaviyoError,
  });

  const { campaignsApi } = getKlaviyoApis(token);

  const items: GetCampaignResponseCollectionCompoundDocumentDataInner[] = [];
  let pageCursor = undefined;

  try {
    do {
      const response = await campaignsApi.getCampaigns('equals(messages.channel,"sms")', {
        ...(pageCursor && { pageCursor }),
      });

      items.push(...response.body.data);
      pageCursor = response.body.links?.next;
    } while (pageCursor);
  } catch (error) {
    console.error(`Failed to fetch campaigns: ${error}`);
  }

  return items.map(mapKlaviyoItemToAllowedValue);
};
