import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { createYouTubeClient } from '../helpers/constants';
import { getYouTubeUserVideosAllowedValues } from '../helpers/get-user-video-allowed-values';
import { getYouTubeUserPlaylistsAllowedValues } from '../helpers/get-playlist-allowed-values';

const action = 'add_video_to_playlist';

const options = {
  playlistId: {
    type: 'string',
    required: true,
    get_allowed_values: getYouTubeUserPlaylistsAllowedValues,
  },
  videoId: {
    type: 'string',
    required: true,
    get_allowed_values: getYouTubeUserVideosAllowedValues,
  },
  position: {
    type: 'number',
    required: false,
  },
} satisfies TQoreOptions;

const addVideoToPlaylist = QoreAppCreator.createLocalizedAction<typeof options>({
  app: YOUTUBE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, playlistId, videoId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['playlistId', 'videoId'],
      ErrorClass: YouTubeError,
    });

    const client = createYouTubeClient(token);

    const { position } = obj || {};

    try {
      const response = await client.playlistItems.insert({
        part: ['snippet', 'contentDetails'],
        requestBody: {
          snippet: {
            playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId,
            },
            ...(position !== undefined && { position }),
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
    },
  },
});

export default addVideoToPlaylist;
