import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { createYouTubeClient } from '../helpers/constants';
import { getYouTubeUserChannelsAllowedValues } from '../helpers/get-user-channel-allowed-values';

const YouTubeNewChannelVideoTrigger = QoreAppCreator.createLocalizedTrigger({
  app: YOUTUBE_APP_NAME,
  action: 'new_channel_video',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    channel: {
      type: 'string',
      required: true,
      get_allowed_values: getYouTubeUserChannelsAllowedValues,
      allowed_values_creatable: true,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, channel } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['channel'],
      ErrorClass: YouTubeError,
    });

    const client = createYouTubeClient(token);

    const channelResponse = await client.channels.list({
      id: [channel],
      part: ['contentDetails'],
    });

    const uploadsPlaylistId =
      channelResponse.data.items?.[0].contentDetails?.relatedPlaylists?.uploads;

    const getItems = () => {
      return fetchLatestVideos({
        token,
        uploadsPlaylistId,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'youtube_new_channel_video',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, channel } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['channel'],
      ErrorClass: YouTubeError,
    });

    const client = createYouTubeClient(token);

    const channelResponse = await client.channels.list({
      id: [channel],
      part: ['contentDetails'],
    });

    const uploadsPlaylistId =
      channelResponse.data.items?.[0].contentDetails?.relatedPlaylists?.uploads;

    const videos = await fetchLatestVideos({
      token,
      uploadsPlaylistId,
    });

    return videos?.length ? videos[0] : null;
  },
  event_info: {
    desc: 'YouTube New Channel Video Trigger Event Info',
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
              playlistId: { type: 'string' },
              position: { type: 'integer' },
              resourceId: {
                type: {
                  type: 'hash',
                  fields: {
                    kind: { type: 'string' },
                    videoId: { type: 'string' },
                  },
                },
              },
              videoOwnerChannelTitle: { type: 'string' },
              videoOwnerChannelId: { type: 'string' },
            },
          },
        },
        contentDetails: {
          type: {
            type: 'hash',
            fields: {
              videoId: { type: 'string' },
              videoPublishedAt: { type: 'string' },
            },
          },
        },
        status: {
          type: {
            type: 'hash',
            fields: {
              privacyStatus: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

const fetchLatestVideos = async (options: {
  token: string;
  uploadsPlaylistId: string | undefined;
}): Promise<Array<Record<string, any>>> => {
  const maxResults = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { token, uploadsPlaylistId } = options;

  if (!uploadsPlaylistId) {
    throw new YouTubeError('No uploads playlist found for the channel.');
  }

  try {
    const client = createYouTubeClient(token);

    const playListResponse = await client.playlistItems.list({
      part: ['contentDetails', 'snippet', 'status'],
      playlistId: uploadsPlaylistId,
      maxResults,
    });

    return playListResponse.data.items || [];
  } catch (error) {
    throw new YouTubeError(`Failed to fetch latest videos: ${error.message || error}`);
  }
};

export default YouTubeNewChannelVideoTrigger;
