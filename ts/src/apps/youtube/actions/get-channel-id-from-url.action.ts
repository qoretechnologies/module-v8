import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { createYouTubeClient } from '../helpers/constants';
import { extractYouTubeChannelId } from '../helpers/extract-channel-id-from-url';

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
      const channelId = await extractYouTubeChannelId(url, client);

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

export default getChannelIdFromUrl;
