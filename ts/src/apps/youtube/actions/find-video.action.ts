import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { createYouTubeClient } from '../helpers/constants';
import { getYouTubeCategoryAllowedValues } from '../helpers/get-category-allowed-values';
import { omit } from 'lodash';

const action = 'search_videos';

const options = {
  q: {
    type: 'string',
    required: true,
  },
  order: {
    type: 'string',
    required: false,
    default_value: 'relevance',
    allowed_values: [
      { value: 'relevance', display_name: 'Relevance' },
      { value: 'date', display_name: 'Upload Date' },
      { value: 'rating', display_name: 'Rating' },
      { value: 'title', display_name: 'Title' },
      { value: 'viewCount', display_name: 'View Count' },
    ],
  },
  publishedAfter: {
    type: 'string',
    required: false,
  },
  publishedBefore: {
    type: 'string',
    required: false,
  },
  videoDuration: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'any', display_name: 'Any' },
      { value: 'short', display_name: 'Short (< 4 minutes)' },
      { value: 'medium', display_name: 'Medium (4-20 minutes)' },
      { value: 'long', display_name: 'Long (> 20 minutes)' },
    ],
  },
  videoDefinition: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'any', display_name: 'Any' },
      { value: 'standard', display_name: 'Standard Definition' },
      { value: 'high', display_name: 'High Definition' },
    ],
  },
  videoDimension: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'any', display_name: 'Any' },
      { value: '2d', display_name: '2D' },
      { value: '3d', display_name: '3D' },
    ],
  },
  videoCaption: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'any', display_name: 'Any' },
      { value: 'closedCaption', display_name: 'Closed Caption' },
      { value: 'none', display_name: 'None' },
    ],
  },
  videoLicense: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'any', display_name: 'Any' },
      { value: 'youtube', display_name: 'Standard YouTube License' },
      { value: 'creativeCommon', display_name: 'Creative Commons' },
    ],
  },
  safeSearch: {
    type: 'string',
    required: false,
    default_value: 'moderate',
    allowed_values: [
      { value: 'moderate', display_name: 'Moderate' },
      { value: 'none', display_name: 'None' },
      { value: 'strict', display_name: 'Strict' },
    ],
  },
  regionCode: {
    type: 'string',
    required: false,
  },
  relevanceLanguage: {
    type: 'string',
    required: false,
  },
  videoCategoryId: {
    type: 'string',
    required: false,
    get_allowed_values: getYouTubeCategoryAllowedValues,
  },
  maxResults: {
    type: 'number',
    required: false,
    default_value: 25,
  },
  pageToken: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const searchVideos = QoreAppCreator.createLocalizedAction<typeof options>({
  app: YOUTUBE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, q } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['q'],
      ErrorClass: YouTubeError,
    });

    const client = createYouTubeClient(token);

    const {
      order = 'relevance',
      publishedAfter,
      publishedBefore,
      videoDuration,
      videoDefinition,
      videoDimension,
      videoCaption,
      videoLicense,
      safeSearch = 'moderate',
      regionCode,
      relevanceLanguage,
      videoCategoryId,
      maxResults = 25,
      pageToken,
    } = obj || {};

    try {
      const response = await client.search.list({
        part: ['snippet'],
        q,
        type: ['video'],
        order,
        ...(publishedAfter && { publishedAfter }),
        ...(publishedBefore && { publishedBefore }),
        ...(videoDuration && { videoDuration }),
        ...(videoDefinition && { videoDefinition }),
        ...(videoDimension && { videoDimension }),
        ...(videoCaption && { videoCaption }),
        ...(videoLicense && { videoLicense }),
        safeSearch,
        ...(regionCode && { regionCode }),
        ...(relevanceLanguage && { relevanceLanguage }),
        ...(videoCategoryId && { videoCategoryId }),
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
      regionCode: { type: 'string' },
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
      },
    },
  },
});

export default searchVideos;
