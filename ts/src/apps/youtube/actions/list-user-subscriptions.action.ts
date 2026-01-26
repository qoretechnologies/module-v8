import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { createYouTubeClient } from '../helpers/constants';

const action = 'list_user_subscriptions';

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

const listUserSubscriptions = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const userSubscriptionResponse = await client.subscriptions.list({
        mine: true,
        part: ['snippet'],
        maxResults,
        ...(nextPageToken && { pageToken: nextPageToken }),
      });

      return userSubscriptionResponse.data.items?.map((item) => {
        return {
          id: item.id,
          ...item.snippet,
        };
      });
    } catch (error) {
      throw new YouTubeError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        publishedAt: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        resourceId: {
          type: {
            type: 'hash',
            fields: {
              kind: { type: 'string' },
              channelId: { type: 'string' },
            },
          },
        },
        channelId: { type: 'string' },
        thumbnails: {
          type: {
            type: 'hash',
            fields: {
              default: {
                type: {
                  type: 'hash',
                  fields: {
                    url: { type: 'string' },
                  },
                },
              },
              medium: {
                type: {
                  type: 'hash',
                  fields: {
                    url: { type: 'string' },
                  },
                },
              },
              high: {
                type: {
                  type: 'hash',
                  fields: {
                    url: { type: 'string' },
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

export default listUserSubscriptions;
