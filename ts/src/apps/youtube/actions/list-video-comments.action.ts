import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { createYouTubeClient } from '../helpers/constants';
import { getYouTubeUserVideosAllowedValues } from '../helpers/get-user-video-allowed-values';
import { omit } from 'lodash';

const action = 'list_video_comments';

const options = {
  videoId: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getYouTubeUserVideosAllowedValues,
  },
  order: {
    type: 'string',
    required: false,
    default_value: 'time',
    allowed_values: [
      { value: 'time', display_name: 'Time (newest first)' },
      { value: 'relevance', display_name: 'Relevance' },
    ],
  },
  searchTerms: {
    type: 'string',
    required: false,
  },
  textFormat: {
    type: 'string',
    required: false,
    default_value: 'html',
    allowed_values: [
      { value: 'html', display_name: 'HTML' },
      { value: 'plainText', display_name: 'Plain Text' },
    ],
  },
  maxResults: {
    type: 'number',
    required: false,
    default_value: 20,
  },
  pageToken: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listVideoComments = QoreAppCreator.createLocalizedAction<typeof options>({
  app: YOUTUBE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, videoId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['videoId'],
      ErrorClass: YouTubeError,
    });

    const client = createYouTubeClient(token);

    const {
      order = 'time',
      searchTerms,
      textFormat = 'html',
      maxResults = 20,
      pageToken,
    } = obj || {};

    try {
      const response = await client.commentThreads.list({
        part: ['snippet', 'replies'],
        videoId,
        order,
        ...(searchTerms && { searchTerms }),
        textFormat,
        maxResults,
        ...(pageToken && { pageToken }),
      });

      return omit(response.data, ['kind', 'etag']);
    } catch (error) {
      throw new YouTubeError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      nextPageToken: { type: 'string' },
      pageInfo: {
        type: {
          type: 'hash',
          fields: {
            totalResults: { type: 'integer' },
            resultsPerPage: { type: 'integer' },
          },
        },
      },
      items: {
        type: {
          type: 'list',
          element_type: {
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
                                canRate: { type: 'bool' },
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
                    canReply: { type: 'bool' },
                    totalReplyCount: { type: 'integer' },
                    isPublic: { type: 'bool' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export default listVideoComments;
