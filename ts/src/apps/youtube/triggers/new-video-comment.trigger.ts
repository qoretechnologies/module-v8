import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { getYouTubeUserVideosAllowedValues } from '../helpers/get-user-video-allowed-values';
import { createYouTubeClient } from '../helpers/constants';

const YouTubeNewVideoCommentTrigger = QoreAppCreator.createLocalizedTrigger({
  app: YOUTUBE_APP_NAME,
  action: 'new_video_comment',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    video: {
      type: 'string',
      required: true,
      allowed_values_creatable: true,
      get_allowed_values: getYouTubeUserVideosAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, video } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['video'],
      ErrorClass: YouTubeError,
    });

    const getItems = () => {
      return fetchLatestComments({
        token,
        video,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'youtube_new_video_comment',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, video } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['video'],
      ErrorClass: YouTubeError,
    });

    const resources = await fetchLatestComments({
      token,
      video,
    });

    return resources?.length ? resources[0] : null;
  },
  event_info: {
    desc: 'YouTube New Video Comment Trigger Event Info',
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
              channelId: { type: 'string' },
              videoId: { type: 'string' },
              topLevelComment: {
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
                          channelId: { type: 'string' },
                          videoId: { type: 'string' },
                          textDisplay: { type: 'string' },
                          textOriginal: { type: 'string' },
                          authorDisplayName: { type: 'string' },
                          authorProfileImageUrl: { type: 'string' },
                          authorChannelUrl: { type: 'string' },
                          authorChannelId: {
                            type: {
                              type: 'hash',
                              fields: {
                                value: { type: 'string' },
                              },
                            },
                          },
                          canRate: { type: 'boolean' },
                          viewerRating: { type: 'string' },
                          likeCount: { type: 'integer' },
                          publishedAt: { type: 'string' },
                          updatedAt: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              canReply: { type: 'boolean' },
              totalReplyCount: { type: 'integer' },
              isPublic: { type: 'boolean' },
            },
          },
        },
      },
    },
  },
});

const fetchLatestComments = async (options: {
  token: string;
  video: string;
}): Promise<Array<Record<string, any>>> => {
  const pageSize = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { token, video } = options;

  try {
    const client = createYouTubeClient(token);

    const params = { order: 'time', textFormat: 'html', maxResults: pageSize };

    const response = await client.commentThreads.list({
      part: ['snippet', 'replies'],
      videoId: video,
      ...params,
    });

    return response.data.items || [];
  } catch (error) {
    throw new YouTubeError(`Failed to fetch latest video comments: ${error.message || error}`);
  }
};

export default YouTubeNewVideoCommentTrigger;
