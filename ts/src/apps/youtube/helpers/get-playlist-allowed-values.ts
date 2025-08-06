import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { YouTubeError } from '../constants';
import { createYouTubeClient } from './constants';

export const getYouTubeUserPlaylistsAllowedValues: TQoreGetAllowedValuesFunction<
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
    const response = await client.playlists.list({
      mine: true,
      part: ['snippet'],
      maxResults: 50,
    });

    const allowedValues: IQoreAllowedValue<string>[] =
      response.data.items?.map((item) => {
        return {
          value: item.id!,
          display_name: item.snippet?.title || 'No title',
          desc: item.snippet?.description || 'No description',
          ...(item.snippet?.thumbnails?.default && {
            image: item.snippet.thumbnails.default.url as string,
          }),
        };
      }) || [];

    return allowedValues;
  } catch (error) {
    throw new YouTubeError(`Failed to fetch user playlists: ${error.message || error}`);
  }
};
