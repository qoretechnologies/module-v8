import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getPatreonCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';
import { DeregisterPatreonWebhook, RegisterPatreonWebhook } from './constants';
import { PATREON_APP_NAME, PatreonError } from '../constants';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { createPatreonClient } from '../helpers/constants';
import { QueryBuilder } from 'patreon-api.ts';

const action = 'post_trigger';

const options = {
  campaignId: {
    type: 'string',
    required: true,
    get_allowed_values: getPatreonCampaignAllowedValues,
  },
  trigger: {
    type: 'string',
    required: true,
    allowed_values: [
      {
        value: 'posts:publish',
        display_name: 'Post Published',
        desc: 'Triggered when a post is published on a campaign.',
      },
      {
        value: 'posts:update',
        display_name: 'Post Updated',
        desc: 'Triggered when a post is updated on a campaign.',
      },
      {
        value: 'posts:delete',
        display_name: 'Post Deleted',
        desc: 'Triggered when a post is deleted on a campaign.',
      },
    ],
  },
} satisfies TQoreOptions;

const PostTrigger = QoreAppCreator.createLocalizedTrigger({
  app: PATREON_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options,
  webhook_register: RegisterPatreonWebhook,
  webhook_deregister: DeregisterPatreonWebhook,
  get_example_event_data: async (context) => {
    const { token, campaignId } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['campaignId'],
      ErrorClass: PatreonError,
    });

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
            'is_public',
            'published_at',
            'title',
            'url',
            'tiers',
          ],
        })
        .addRelationships(['campaign', 'user'])
        .setRequestOptions({
          sort: { key: 'published_at', descending: true },
          count: 1,
        });

      const response = await client.fetchCampaignPosts(campaignId, query);

      return response.data[0];
    } catch (error) {
      throw new PatreonError(
        `Failed to get example data for ${humanizeNameTitle(action)}: ${error?.message || error}`
      );
    }
  },
  event_info: {
    desc: 'Patreon New Post Event Data',
    type: {
      type: 'hash',
      fields: {
        data: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              type: { type: 'string' },
              attributes: {
                type: {
                  type: 'hash',
                  fields: {
                    app_id: { type: 'string' },
                    app_status: { type: 'string' },
                    content: { type: 'string' },
                    embed_data: { type: 'string' },
                    embed_url: { type: 'string' },
                    is_paid: { type: 'bool' },
                    is_public: { type: 'bool' },
                    published_at: { type: 'string' },
                    tiers: {
                      type: {
                        type: 'list',
                        element_type: 'string',
                      },
                    },
                    title: { type: 'string' },
                    url: { type: 'string' },
                  },
                },
              },
              relationships: {
                type: {
                  type: 'hash',
                  fields: {
                    campaign: {
                      type: {
                        type: 'hash',
                        fields: {
                          data: {
                            type: {
                              type: 'hash',
                              fields: {
                                id: { type: 'string' },
                                type: { type: 'string' },
                              },
                            },
                          },
                          links: {
                            type: {
                              type: 'hash',
                              fields: {
                                related: { type: 'string' },
                              },
                            },
                          },
                        },
                      },
                    },
                    user: {
                      type: {
                        type: 'hash',
                        fields: {
                          data: {
                            type: {
                              type: 'hash',
                              fields: {
                                id: { type: 'string' },
                                type: { type: 'string' },
                              },
                            },
                          },
                          links: {
                            type: {
                              type: 'hash',
                              fields: {
                                related: { type: 'string' },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        included: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                id: { type: 'string' },
                type: { type: 'string' },
                attributes: { type: 'hash' },
              },
            },
          },
        },
        links: {
          type: {
            type: 'hash',
            fields: {
              self: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default PostTrigger;
