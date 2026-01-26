import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { createYouTubeClient } from '../helpers/constants';
import { omit } from 'lodash';

const action = 'list_user_videos';

const options = {
  maxResults: {
    type: 'number',
    default_value: 10,
    required: false,
  },
  nextPageToken: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listUserVideos = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { maxResults = 10, nextPageToken } = obj || {};

    try {
      const userChannelResponse = await client.channels.list({
        mine: true,
        part: ['contentDetails'],
      });

      const uploadsPlaylistId =
        userChannelResponse.data.items?.[0].contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        throw new YouTubeError('No uploads playlist found for the user.');
      }

      const playListResponse = await client.playlistItems.list({
        part: ['contentDetails', 'snippet', 'status'],
        playlistId: uploadsPlaylistId,
        maxResults,
        ...(nextPageToken && { pageToken: nextPageToken }),
      });

      return omit(playListResponse.data, ['kind', 'etag']);
    } catch (error) {
      throw new YouTubeError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
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
      },
      pageInfo: {
        type: {
          type: 'hash',
          fields: {
            totalResults: { type: 'integer' },
            resultsPerPage: { type: 'integer' },
          },
        },
      },
    },
  },
});

export default listUserVideos;
