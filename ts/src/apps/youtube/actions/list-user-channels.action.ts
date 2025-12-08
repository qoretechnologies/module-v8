import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { createYouTubeClient } from '../helpers/constants';
import { omit } from 'lodash';

const action = 'list_user_channels';

const options = {
  maxResults: {
    type: 'number',
    preselected: true,
    default_value: 5,
    required: false,
  },
  nextPageToken: {
    preselected: true,
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listUserChannels = QoreAppCreator.createLocalizedAction<typeof options>({
  app: YOUTUBE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: YouTubeError,
    });

    const client = createYouTubeClient(token);

    const { maxResults = 5, nextPageToken } = obj || {};

    try {
      const userChannelResponse = await client.channels.list({
        mine: true,
        part: [
          'snippet',
          'contentDetails',
          'brandingSettings',
          'contentDetails',
          'contentOwnerDetails',
          'statistics',
        ],
        maxResults,
        ...(nextPageToken && { pageToken: nextPageToken }),
      });

      return omit(userChannelResponse.data, ['kind', 'etag']);
    } catch (error) {
      throw new YouTubeError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
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
                    relatedPlaylists: {
                      type: {
                        type: 'hash',
                        fields: {
                          likes: { type: 'string' },
                          uploads: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              statistics: {
                type: {
                  type: 'hash',
                  fields: {
                    viewCount: { type: 'string' },
                    subscriberCount: { type: 'string' },
                    hiddenSubscriberCount: { type: 'bool' },
                    videoCount: { type: 'string' },
                  },
                },
              },
              brandingSettings: {
                type: {
                  type: 'hash',
                  fields: {
                    channel: {
                      type: {
                        type: 'hash',
                        fields: {
                          title: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              contentOwnerDetails: { type: 'hash' },
            },
          },
        },
      },
    },
  },
});

export default listUserChannels;
