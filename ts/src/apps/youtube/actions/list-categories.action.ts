import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { createYouTubeClient } from '../helpers/constants';

const action = 'list_categories';

const listCategories = QoreAppCreator.createLocalizedAction({
  app: YOUTUBE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: YouTubeError,
    });

    const client = createYouTubeClient(token);

    try {
      const response = await client.videoCategories.list({
        part: ['id', 'snippet'],
        regionCode: 'US',
      });

      return response.data.items;
    } catch (error) {
      throw new YouTubeError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
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
              assignable: {
                type: 'bool',
              },
              channelId: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default listCategories;
