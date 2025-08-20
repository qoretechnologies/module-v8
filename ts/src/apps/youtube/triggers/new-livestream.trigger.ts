import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { createYouTubeClient } from '../helpers/constants';
import { getYouTubeUserChannelsAllowedValues } from '../helpers/get-user-channel-allowed-values';
import { youtube_v3 } from '@googleapis/youtube';
import { getYouTubeUserSubscriptionsAllowedValues } from '../helpers/get-user-subscriptions-allowed-values';
import { extractYouTubeChannelId } from '../helpers/extract-channel-id-from-url';

const YouTubeNewLivestreamTrigger = QoreAppCreator.createLocalizedTrigger({
  app: YOUTUBE_APP_NAME,
  action: 'new_livestream',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    channel: {
      type: 'string',
      required_groups: ['channel_selection'],
      get_allowed_values: async (context) => {
        const [channels, subscriptions] = await Promise.all([
          getYouTubeUserChannelsAllowedValues(context),
          getYouTubeUserSubscriptionsAllowedValues(context),
        ]);

        return [...channels, ...subscriptions];
      },
      allowed_values_creatable: true,
    },
    channel_url: {
      type: 'string',
      required_groups: ['channel_selection'],
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: YouTubeError,
    });

    const channelId = context?.opts?.channel;
    const channelUrl = context?.opts?.channel_url;

    if (!channelId && !channelUrl) {
      throw new YouTubeError('Channel ID or URL is required');
    }

    const client = createYouTubeClient(token);
    const channel = channelId || (await extractYouTubeChannelId(channelUrl!, client));

    const getItems = () => {
      return fetchLatestLivestreams({
        token,
        channel,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'youtube_new_livestream',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: YouTubeError,
    });

    const channelId = context?.opts?.channel;
    const channelUrl = context?.opts?.channel_url;

    if (!channelId && !channelUrl) {
      throw new YouTubeError('Channel ID or URL is required');
    }

    const client = createYouTubeClient(token);
    const channel = channelId || (await extractYouTubeChannelId(channelUrl!, client));

    const livestreams = await fetchLatestLivestreams({
      token,
      channel,
    });

    return livestreams?.length ? livestreams[0] : null;
  },
  event_info: {
    desc: 'YouTube New Livestream Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        kind: { type: 'string' },
        etag: { type: 'string' },
        id: { type: 'string' },
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
                    standard: {
                      type: {
                        type: 'hash',
                        fields: {
                          url: { type: 'string' },
                          width: { type: 'integer' },
                          height: { type: 'integer' },
                        },
                      },
                    },
                    maxres: {
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
              tags: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              categoryId: { type: 'string' },
              liveBroadcastContent: { type: 'string' },
              localized: {
                type: {
                  type: 'hash',
                  fields: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        status: {
          type: {
            type: 'hash',
            fields: {
              uploadStatus: { type: 'string' },
              privacyStatus: { type: 'string' },
              license: { type: 'string' },
              embeddable: { type: 'boolean' },
              publicStatsViewable: { type: 'boolean' },
              madeForKids: { type: 'boolean' },
            },
          },
        },
        statistics: {
          type: {
            type: 'hash',
            fields: {
              viewCount: { type: 'string' },
              likeCount: { type: 'string' },
              favoriteCount: { type: 'string' },
              commentCount: { type: 'string' },
            },
          },
        },
        liveStreamingDetails: {
          type: {
            type: 'hash',
            fields: {
              actualStartTime: { type: 'string' },
              scheduledStartTime: { type: 'string' },
              concurrentViewers: { type: 'string' },
              activeLiveChatId: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

const fetchLatestLivestreams = async (options: {
  token: string;
  channel?: string;
}): Promise<Array<Record<string, any>>> => {
  const maxResults = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { token, channel } = options;

  try {
    const client = createYouTubeClient(token);

    const searchParams: youtube_v3.Params$Resource$Search$List = {
      part: ['snippet'],
      type: ['video'],
      eventType: 'live',
      maxResults,
      order: 'date',
    };

    if (channel) {
      searchParams.channelId = channel;
    }

    const searchResponse = await client.search.list(searchParams);
    const searchItems = searchResponse.data.items || [];

    if (searchItems.length === 0) {
      return [];
    }

    const videoIds = searchItems.map((item) => item.id?.videoId).filter(Boolean);

    if (videoIds.length === 0) {
      return [];
    }

    const videoResponse = await client.videos.list({
      part: ['snippet', 'liveStreamingDetails', 'statistics', 'status'],
      id: videoIds as string[],
    });

    const videos = videoResponse.data.items || [];

    const liveVideos = videos.filter((video) => {
      return video.snippet?.liveBroadcastContent === 'live';
    });

    return liveVideos;
  } catch (error) {
    throw new YouTubeError(`Failed to fetch latest livestreams: ${error.message || error}`);
  }
};

export default YouTubeNewLivestreamTrigger;
