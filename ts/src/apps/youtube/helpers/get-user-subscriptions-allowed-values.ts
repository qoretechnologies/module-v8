import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { YouTubeError } from '../constants';
import { createYouTubeClient } from './constants';

export const getYouTubeUserSubscriptionsAllowedValues: TQoreGetAllowedValuesFunction<
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
    const subscriptionsResponse = await client.subscriptions.list({
      mine: true,
      part: ['snippet'],
      maxResults: 500,
    });

    const allowedValues: IQoreAllowedValue<string>[] =
      subscriptionsResponse.data.items?.map((item) => {
        return {
          value: item.snippet!.channelId!,
          display_name: item.snippet?.title || 'No title',
          ...(item.snippet?.thumbnails?.default && {
            image: item.snippet.thumbnails.default.url as string,
          }),
          ...(item.snippet?.description && {
            desc: item.snippet.description,
          }),
        };
      }) || [];

    return allowedValues;
  } catch (error) {
    throw new YouTubeError(`Failed to fetch user subscriptions: ${error.message || error}`);
  }
};
