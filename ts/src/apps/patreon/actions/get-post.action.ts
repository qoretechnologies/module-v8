import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { QueryBuilder } from 'patreon-api.ts';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { PATREON_APP_NAME, PatreonError } from '../constants';
import { createPatreonClient } from '../helpers/constants';
import { getPatreonCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';
import { getPatreonPostAllowedValues } from '../helpers/get-post-allowed-values';

const action = 'get_post';

const options = {
  campaignId: {
    type: 'string',
    required: false,
    preselected: true,
    get_allowed_values: getPatreonCampaignAllowedValues,
    on_change: ['refetch'],
  },
  postId: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getPatreonPostAllowedValues,
  },
} satisfies TQoreOptions;

const getPost = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PATREON_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, postId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['postId'],
      ErrorClass: PatreonError,
    });

    try {
      const client = createPatreonClient(token);
      const query = QueryBuilder.post.setAttributes({
        post: [
          'app_id',
          'app_status',
          'content',
          'embed_data',
          'embed_url',
          'is_paid',
          'published_at',
          'title',
          'url',
        ],
      });

      const response = await client.fetchPost(postId, query);

      return {
        id: response.data.id,
        ...response.data.attributes,
      };
    } catch (error) {
      throw new PatreonError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      title: { type: 'string' },
      content: { type: 'string' },
      published_at: { type: 'string' },
      url: { type: 'string' },
      image: {
        type: {
          type: 'hash',
          fields: {
            large_url: { type: 'string' },
            thumb_url: { type: 'string' },
          },
        },
      },
      is_paid: { type: 'boolean' },
      is_public: { type: 'boolean' },
      post_type: { type: 'string' },
      embed_data: { type: 'string' },
      embed_url: { type: 'string' },
      like_count: { type: 'integer' },
      comment_count: { type: 'integer' },
    },
  },
});

export default getPost;
