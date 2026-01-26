import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { Readable } from 'node:stream';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { createYouTubeClient } from '../helpers/constants';
import { getYouTubeCategoryAllowedValues } from '../helpers/get-category-allowed-values';

const action = 'upload_video';

const options = {
  title: {
    type: 'string',
    required: true,
  },
  video: {
    type: 'file',
    required: true,
  },
  category: {
    type: 'string',
    required: true,
    get_allowed_values: getYouTubeCategoryAllowedValues,
  },
  privacy: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'public', display_name: 'Public' },
      { value: 'private', display_name: 'Private' },
      { value: 'unlisted', display_name: 'Unlisted' },
    ],
  },
  description: {
    type: 'string',
    required: false,
  },
  forKids: {
    type: 'bool',
    required: false,
  },
  tags: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
} satisfies TQoreOptions;

const uploadVideo = QoreAppCreator.createLocalizedAction<typeof options>({
  app: YOUTUBE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, title, video, privacy } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['title', 'video', 'privacy'],
      ErrorClass: YouTubeError,
    });

    const client = createYouTubeClient(token);

    const { forKids = false, description, tags, category } = obj || {};

    try {
      const videoReadable = Readable.from(Buffer.from(video.content, 'base64'));

      const response = await client.videos.insert({
        part: ['snippet', 'status', 'contentDetails', 'statistics'],
        requestBody: {
          snippet: {
            title,

            ...(category && { categoryId: category }),
            ...(description && { description }),
            ...(tags?.length && { tags }),
          },
          status: {
            privacyStatus: privacy,
            madeForKids: forKids,
          },
        },
        media: {
          body: videoReadable,
          mimeType: video.mime_type,
        },
      });

      return response.data;
    } catch (error) {
      throw new YouTubeError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
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
      contentDetails: {
        type: {
          type: 'hash',
          fields: {
            duration: { type: 'string' },
            dimension: { type: 'string' },
            definition: { type: 'string' },
            caption: { type: 'string' },
            licensedContent: { type: 'bool' },
            contentRating: { type: 'hash' },
            projection: { type: 'string' },
            hasCustomThumbnail: { type: 'bool' },
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
            embeddable: { type: 'bool' },
            publicStatsViewable: { type: 'bool' },
          },
        },
      },
      statistics: {
        type: {
          type: 'hash',
          fields: {
            viewCount: { type: 'string' },
            likeCount: { type: 'string' },
            dislikeCount: { type: 'string' },
            favoriteCount: { type: 'string' },
            commentCount: { type: 'string' },
          },
        },
      },
    },
  },
});

export default uploadVideo;
