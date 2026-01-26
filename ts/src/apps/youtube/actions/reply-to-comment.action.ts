import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { YOUTUBE_APP_NAME, YouTubeError } from '../constants';
import { createYouTubeClient } from '../helpers/constants';

const action = 'reply_to_comment';

const options = {
  parentId: {
    type: 'string',
    required: false,
    preselected: true,
  },
  textOriginal: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const replyToComment = QoreAppCreator.createLocalizedAction<typeof options>({
  app: YOUTUBE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, textOriginal } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['parentId', 'textOriginal'],
      ErrorClass: YouTubeError,
    });

    const parentId = obj?.parentId;

    const client = createYouTubeClient(token);

    try {
      const response = await client.comments.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            ...(parentId && { parentId }),
            textOriginal,
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
            channelId: { type: 'string' },
            textDisplay: { type: 'string' },
            textOriginal: { type: 'string' },
            parentId: { type: 'string' },
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
});

export default replyToComment;
