import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { createYouTubeClient } from '../helpers/constants';

const YouTubeNewVideoBySearchTrigger = QoreAppCreator.createLocalizedTrigger({
  app: YOUTUBE_APP_NAME,
  action: 'new_video_by_search',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    query: {
      type: 'string',
      required: true,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, query } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['query'],
      ErrorClass: YouTubeError,
    });

    const getItems = () => {
      return fetchLatestVideos({
        token,
        query,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'youtube_new_video_by_search',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, query } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['query'],
      ErrorClass: YouTubeError,
    });

    const videos = await fetchLatestVideos({
      token,
      query,
    });

    return videos?.length ? videos[0] : null;
  },
  event_info: {
    desc: 'YouTube New Video By Search Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        kind: { type: 'string' },
        etag: { type: 'string' },
        id: {
          type: {
            type: 'hash',
            fields: {
              kind: { type: 'string' },
              videoId: { type: 'string' },
            },
          },
        },
        snippet: {
          type: {
            type: 'hash',
            fields: {
              publishedAt: { type: 'string' },
              channelId: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
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
              channelTitle: { type: 'string' },
              liveBroadcastContent: { type: 'string' },
              publishTime: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

const fetchLatestVideos = async (options: {
  token: string;
  query: string;
}): Promise<Array<Record<string, any>>> => {
  const pageSize = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { token, query } = options;

  try {
    const client = createYouTubeClient(token);

    const response = await client.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      order: 'date',
      maxResults: pageSize,
    });

    return response.data.items || [];
  } catch (error) {
    throw new YouTubeError(`Failed to fetch latest videos: ${error.message || error}`);
  }
};

export default YouTubeNewVideoBySearchTrigger;
