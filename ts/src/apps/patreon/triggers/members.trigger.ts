import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { QueryBuilder } from 'patreon-api.ts';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { PATREON_APP_NAME, PatreonError } from '../constants';
import { createPatreonClient } from '../helpers/constants';
import { getPatreonCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';
import { DeregisterPatreonWebhook, RegisterPatreonWebhook } from './constants';

const action = 'member_trigger';

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
        value: 'members:create',
        display_name: 'Member Created',
        desc: 'Triggered when a new member is created. Note that you may get more than one of these per patron if they delete and renew their membership. Member creation only occurs if there was no prior payment between patron and creator.',
      },
      {
        value: 'members:update',
        display_name: 'Member Updated',
        desc: 'Triggered when the membership information is changed. Includes updates on payment charging events.',
      },
      {
        value: 'members:delete',
        display_name: 'Member Deleted',
        desc: 'Triggered when a membership is deleted. Note that you may get more than one of these per patron if they delete and renew their membership. Deletion only occurs if no prior payment happened, otherwise pledge deletion is an update to member status.',
      },
    ],
  },
} satisfies TQoreOptions;

const MemberTrigger = QoreAppCreator.createLocalizedTrigger({
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
      const query = QueryBuilder.campaignMembers
        .setAttributes({
          member: [
            'campaign_lifetime_support_cents',
            'currently_entitled_amount_cents',
            'email',
            'full_name',
            'is_follower',
            'is_free_trial',
            'is_gifted',
            'last_charge_date',
            'last_charge_status',
            'lifetime_support_cents',
            'next_charge_date',
            'note',
            'patron_status',
            'pledge_cadence',
            'pledge_relationship_start',
            'will_pay_amount_cents',
          ],
        })
        .setRequestOptions({
          count: 1,
        });

      const response = await client.fetchCampaignMembers(campaignId, query);

      return response.data?.[0] || null;
    } catch (error) {
      throw new PatreonError(
        `Failed to get example event data for ${humanizeNameTitle(action)}: ${error?.message || error}`
      );
    }
  },
  event_info: {
    desc: 'Patreon Member Event Data',
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
                    campaign_lifetime_support_cents: { type: 'integer' },
                    currently_entitled_amount_cents: { type: 'integer' },
                    email: { type: 'string' },
                    full_name: { type: 'string' },
                    is_follower: { type: 'bool' },
                    is_free_trial: { type: 'bool' },
                    is_gifted: { type: 'bool' },
                    last_charge_date: { type: 'string' },
                    last_charge_status: { type: 'string' },
                    lifetime_support_cents: { type: 'integer' },
                    next_charge_date: { type: 'string' },
                    note: { type: 'string' },
                    patron_status: { type: 'string' },
                    pledge_cadence: { type: 'integer' },
                    pledge_relationship_start: { type: 'string' },
                    will_pay_amount_cents: { type: 'integer' },
                  },
                },
              },
              relationships: {
                type: {
                  type: 'hash',
                  fields: {
                    address: {
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
                    currently_entitled_tiers: {
                      type: {
                        type: 'hash',
                        fields: {
                          data: {
                            type: {
                              type: 'list',
                              element_type: {
                                type: 'hash',
                                fields: {
                                  id: { type: 'string' },
                                  type: { type: 'string' },
                                },
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
                    pledge_history: {
                      type: {
                        type: 'hash',
                        fields: {
                          data: {
                            type: {
                              type: 'list',
                              element_type: {
                                type: 'hash',
                                fields: {
                                  id: { type: 'string' },
                                  type: { type: 'string' },
                                },
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

export default MemberTrigger;
