import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { YouTubeError } from '../constants';
import { createYouTubeClient } from './constants';

export const getYouTubeUserChannelsAllowedValues: TQoreGetAllowedValuesFunction<
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
    const userChannelResponse = await client.channels.list({
      mine: true,
      part: ['snippet'],
      maxResults: 50,
    });

    const allowedValues: IQoreAllowedValue<string>[] =
      userChannelResponse.data.items?.map((item) => {
        return {
          value: item.id!,
          display_name: item.snippet?.title || 'No title',
          ...(item.snippet?.thumbnails?.default && {
            image: item.snippet.thumbnails.default.url as string,
          }),
        };
      }) || [];

    return allowedValues;
  } catch (error) {
    throw new YouTubeError(`Failed to fetch video categories: ${error.message || error}`);
  }
};
