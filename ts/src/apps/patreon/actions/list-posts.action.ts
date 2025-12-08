import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { QueryBuilder } from 'patreon-api.ts';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { PATREON_APP_NAME, PatreonError } from '../constants';
import { createPatreonClient } from '../helpers/constants';
import { getPatreonCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';

const action = 'list_posts';

const options = {
  campaignId: {
    type: 'string',
    required: true,
    get_allowed_values: getPatreonCampaignAllowedValues,
  },
  count: {
    type: 'integer',
    required: false,
  },
  cursor: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listPosts = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PATREON_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, campaignId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['campaignId'],
      ErrorClass: PatreonError,
    });

    const { count = 20, cursor } = obj || {};

    try {
      const client = createPatreonClient(token);
      const query = QueryBuilder.campaignPosts
        .setAttributes({
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
        })
        .setRequestOptions({
          ...(cursor && { cursor }),
          sort: { key: 'published_at', descending: true },
          count,
        });

      const response = await client.fetchCampaignPosts(campaignId, query);

      return {
        posts: response.data.map((post) => {
          return {
            id: post.id,
            ...post.attributes,
          };
        }),
        total: response.meta?.pagination?.total,
        next_cursor: response.meta?.pagination?.cursors?.next || null,
      };
    } catch (error) {
      throw new PatreonError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      posts: {
        type: {
          type: 'list',
          element_type: {
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
              is_paid: { type: 'bool' },
              is_public: { type: 'bool' },
              post_type: { type: 'string' },
              embed_data: { type: 'string' },
              embed_url: { type: 'string' },
              like_count: { type: 'integer' },
              comment_count: { type: 'integer' },
            },
          },
        },
      },
      total: { type: 'integer' },
      next_cursor: { type: 'string' },
    },
  },
});

export default listPosts;
