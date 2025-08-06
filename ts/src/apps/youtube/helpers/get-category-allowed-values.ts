import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { YouTubeError } from '../constants';
import { createYouTubeClient } from './constants';

export const getYouTubeCategoryAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: YouTubeError,
  });

  const client = createYouTubeClient(token);
  try {
    const response = await client.videoCategories.list({
      part: ['id', 'snippet'],
      regionCode: 'US',
    });

    const allowedValues: IQoreAllowedValue<string>[] =
      response.data.items?.map((item) => {
        return {
          value: item.id!,
          display_name: item.snippet?.title || 'No title',
        };
      }) || [];

    return allowedValues;
  } catch (error) {
    throw new YouTubeError(`Failed to fetch video categories: ${error.message || error}`);
  }
};
