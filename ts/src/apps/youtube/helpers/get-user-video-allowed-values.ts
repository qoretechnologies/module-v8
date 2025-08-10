import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { YouTubeError } from '../constants';
import { createYouTubeClient } from './constants';

export const getYouTubeUserVideosAllowedValues: TQoreGetAllowedValuesFunction<
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
      part: ['contentDetails'],
    });

    const uploadsPlaylistId =
      userChannelResponse.data.items?.[0].contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      throw new YouTubeError('No uploads playlist found for the user.');
    }

    const playListResponse = await client.playlistItems.list({
      part: ['contentDetails', 'snippet', 'status'],
      playlistId: uploadsPlaylistId,
      maxResults: 50,
    });

    const allowedValues: IQoreAllowedValue<string>[] =
      playListResponse.data.items?.map((item) => {
        return {
          value: item.snippet!.resourceId!.videoId!,
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
