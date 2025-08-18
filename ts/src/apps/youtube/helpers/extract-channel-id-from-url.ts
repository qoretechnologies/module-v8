import { youtube_v3 } from '@googleapis/youtube';
import { YouTubeError } from '../constants';

export const extractYouTubeChannelId = async (
  url: string,
  client: youtube_v3.Youtube
): Promise<string> => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');

    if (hostname !== 'youtube.com' && hostname !== 'youtu.be' && hostname !== 'm.youtube.com') {
      throw new YouTubeError('Invalid YouTube URL');
    }

    const pathname = urlObj.pathname;

    if (pathname.startsWith('/channel/')) {
      const channelId = pathname.split('/channel/')[1]?.split('/')[0];
      if (channelId && channelId.startsWith('UC') && channelId.length === 24) {
        return channelId;
      }
      throw new YouTubeError('Invalid channel ID format');
    }

    if (pathname.startsWith('/@')) {
      const handle = pathname.substring(2).split('/')[0];

      const channelResponse = await client.channels.list({
        part: ['id'],
        forHandle: handle,
      });

      if (
        channelResponse.data.items &&
        channelResponse.data.items.length > 0 &&
        channelResponse.data.items[0].id
      ) {
        return channelResponse.data.items[0].id;
      }

      throw new YouTubeError(`Could not find channel for handle: @${handle}`);
    }

    if (pathname.startsWith('/c/')) {
      const customUrl = pathname.split('/c/')[1]?.split('/')[0];

      const searchResponse = await client.search.list({
        part: ['snippet'],
        q: customUrl,
        type: ['channel'],
        maxResults: 25,
      });

      if (searchResponse.data.items && searchResponse.data.items.length > 0) {
        for (const item of searchResponse.data.items) {
          const channelId = item.snippet?.channelId;

          if (!channelId) {
            throw new YouTubeError(`Could not find channel ID for item: ${JSON.stringify(item)}`);
          }

          const channelResponse = await client.channels.list({
            part: ['snippet'],
            id: [channelId],
          });

          const channel = channelResponse.data.items?.[0];
          if (channel?.snippet?.customUrl?.toLowerCase() === customUrl.toLowerCase()) {
            return channelId;
          }
        }
      }

      throw new YouTubeError(`Could not find channel for custom URL: /c/${customUrl}`);
    }

    if (pathname.startsWith('/user/')) {
      const username = pathname.split('/user/')[1]?.split('/')[0];

      const channelResponse = await client.channels.list({
        part: ['id'],
        forUsername: username,
      });

      if (
        channelResponse.data.items &&
        channelResponse.data.items.length > 0 &&
        channelResponse.data.items[0].id
      ) {
        return channelResponse.data.items[0].id;
      }

      throw new YouTubeError(`Could not find channel for username: ${username}`);
    }

    if (pathname.startsWith('/watch')) {
      const videoId = urlObj.searchParams.get('v');
      if (!videoId) {
        throw new YouTubeError('No video ID found in URL');
      }

      const videoResponse = await client.videos.list({
        part: ['snippet'],
        id: [videoId],
      });

      if (
        videoResponse.data.items &&
        videoResponse.data.items.length > 0 &&
        videoResponse.data.items[0].snippet!.channelId
      ) {
        return videoResponse.data.items[0].snippet!.channelId;
      }

      throw new YouTubeError('Video not found or not accessible');
    }

    throw new YouTubeError('Unsupported YouTube URL format');
  } catch (error) {
    if (error instanceof YouTubeError) {
      throw error;
    }
    throw new YouTubeError(`Invalid URL format: ${error.message || error}`);
  }
};
