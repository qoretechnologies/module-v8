import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { createYouTubeClient } from '../helpers/constants';
import { getYouTubeCategoryAllowedValues } from '../helpers/get-category-allowed-values';
import { getYouTubeUserVideosAllowedValues } from '../helpers/get-user-video-allowed-values';

const action = 'update_video_details';

const options = {
  title: {
    type: 'string',
    required: false,
  },
  video: {
    type: 'string',
    required: true,
    get_allowed_values: getYouTubeUserVideosAllowedValues,
  },
  category: {
    type: 'string',
    required: false,
    get_allowed_values: getYouTubeCategoryAllowedValues,
  },
  privacy: {
    type: 'string',
    required: false,
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
    type: 'boolean',
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

const updateVideoDetails = QoreAppCreator.createLocalizedAction<typeof options>({
  app: YOUTUBE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, video } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['video'],
      ErrorClass: YouTubeError,
    });

    const client = createYouTubeClient(token);
    const { forKids, description, tags, category, privacy, title } = obj || {};

    const wantsSnippet =
      title !== undefined ||
      description !== undefined ||
      (Array.isArray(tags) && tags.length > 0) ||
      category !== undefined;

    const wantsStatus = privacy !== undefined || typeof forKids === 'boolean';

    if (!wantsSnippet && !wantsStatus) {
      throw new YouTubeError(
        'Nothing to update: provide at least one of title, description, tags, category, privacy, or forKids.'
      );
    }

    let snippet: Record<string, any> | undefined;
    if (wantsSnippet) {
      let categoryIdToUse: string | undefined;

      if (typeof category === 'string' && /^\d+$/.test(category.trim())) {
        categoryIdToUse = category.trim();
      } else if (category !== undefined) {
        throw new YouTubeError(
          'Invalid category: must be a numeric video category ID (string of digits).'
        );
      }

      if (!categoryIdToUse) {
        const getRes = await client.videos.list({
          part: ['snippet'],
          id: [video],
        });
        const currentCat = getRes.data.items?.[0]?.snippet?.categoryId;
        if (!currentCat) {
          throw new YouTubeError(
            'Could not resolve current categoryId. Provide a valid numeric category ID.'
          );
        }
        categoryIdToUse = currentCat;
      }

      snippet = {
        categoryId: categoryIdToUse,
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(Array.isArray(tags) && tags.length > 0 ? { tags } : {}),
      };
    }

    const status: Record<string, any> | undefined = wantsStatus
      ? {
          ...(privacy !== undefined ? { privacyStatus: privacy } : {}),
          ...(typeof forKids === 'boolean' ? { madeForKids: forKids } : {}),
        }
      : undefined;

    const parts: string[] = [];
    if (snippet) parts.push('snippet');
    if (status) parts.push('status');

    try {
      const response = await client.videos.update({
        part: parts,
        requestBody: {
          id: video,
          ...(snippet ? { snippet } : {}),
          ...(status ? { status } : {}),
        },
      });

      return response.data;
    } catch (error: any) {
      throw new YouTubeError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
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
            defaultAudioLanguage: { type: 'string' },
          },
        },
      },
    },
  },
});

export default updateVideoDetails;
