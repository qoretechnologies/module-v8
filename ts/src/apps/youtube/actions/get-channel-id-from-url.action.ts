import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { createYouTubeClient } from '../helpers/constants';

const action = 'get_channel_id_from_url';

const options = {
  url: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const getChannelIdFromUrl = QoreAppCreator.createLocalizedAction<typeof options>({
  app: YOUTUBE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, url } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['url'],
      ErrorClass: YouTubeError,
    });

    const client = createYouTubeClient(token);

    try {
      const channelId = await extractChannelId(url, client);

      const channelResponse = await client.channels.list({
        part: ['snippet', 'statistics'],
        id: [channelId],
      });

      const channelData = channelResponse.data.items?.[0];

      if (!channelData) {
        throw new YouTubeError('Channel not found or not accessible');
      }

      return {
        channelId,
        originalUrl: url,
        channelData: {
          title: channelData.snippet?.title,
          description: channelData.snippet?.description,
          customUrl: channelData.snippet?.customUrl,
          publishedAt: channelData.snippet?.publishedAt,
          thumbnails: channelData.snippet?.thumbnails,
          subscriberCount: channelData.statistics?.subscriberCount,
          videoCount: channelData.statistics?.videoCount,
          viewCount: channelData.statistics?.viewCount,
        },
      };
    } catch (error) {
      throw new YouTubeError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      channelId: { type: 'string' },
      originalUrl: { type: 'string' },
      channelData: {
        type: {
          type: 'hash',
          fields: {
            title: { type: 'string' },
            description: { type: 'string' },
            customUrl: { type: 'string' },
            publishedAt: { type: 'string' },
            thumbnails: {
              type: {
                type: 'hash',
                fields: {
                  default: {
                    type: {
                      type: 'hash',
                      fields: {
                        url: { type: 'string' },
                        width: { type: 'integer' },
                        height: { type: 'integer' },
                      },
                    },
                  },
                  medium: {
                    type: {
                      type: 'hash',
                      fields: {
                        url: { type: 'string' },
                        width: { type: 'integer' },
                        height: { type: 'integer' },
                      },
                    },
                  },
                  high: {
                    type: {
                      type: 'hash',
                      fields: {
                        url: { type: 'string' },
                        width: { type: 'integer' },
                        height: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
            subscriberCount: { type: 'string' },
            videoCount: { type: 'string' },
            viewCount: { type: 'string' },
          },
        },
      },
    },
  },
});

async function extractChannelId(url: string, client: any): Promise<string> {
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

      if (channelResponse.data.items && channelResponse.data.items.length > 0) {
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
          const channelResponse = await client.channels.list({
            part: ['snippet'],
            id: [item.snippet.channelId],
          });

          const channel = channelResponse.data.items?.[0];
          if (channel?.snippet?.customUrl?.toLowerCase() === customUrl.toLowerCase()) {
            return item.snippet.channelId;
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

      if (channelResponse.data.items && channelResponse.data.items.length > 0) {
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

      if (videoResponse.data.items && videoResponse.data.items.length > 0) {
        return videoResponse.data.items[0].snippet.channelId;
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
}

export default getChannelIdFromUrl;
