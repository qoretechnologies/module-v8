import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { createYouTubeClient } from '../helpers/constants';

const action = 'create_playlist';

const options = {
  title: {
    type: 'string',
    required: true,
  },
  description: {
    type: 'string',
    required: false,
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
  tags: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
  defaultLanguage: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const createPlaylist = QoreAppCreator.createLocalizedAction<typeof options>({
  app: YOUTUBE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, title, privacy } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['title', 'privacy'],
      ErrorClass: YouTubeError,
    });

    const client = createYouTubeClient(token);

    const { description, tags, defaultLanguage } = obj || {};

    try {
      const response = await client.playlists.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            ...(description && { description }),
            ...(tags?.length && { tags }),
            ...(defaultLanguage && { defaultLanguage }),
          },
          status: {
            privacyStatus: privacy,
          },
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
            privacyStatus: { type: 'string' },
          },
        },
      },
    },
  },
});

export default createPlaylist;
