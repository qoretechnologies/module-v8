import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { PATREON_APP_NAME } from '../constants';
import { getPatreonCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';
import { DeregisterPatreonWebhook, RegisterPatreonWebhook } from './constants';

const action = 'pledge_trigger';

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
        value: 'members:pledge:create',
        display_name: 'Pledge Created',
        desc: 'Triggered when a new pledge is created for a member. This includes when a member is created through pledging, and when a follower becomes a patron.',
      },
      {
        value: 'members:pledge:update',
        display_name: 'Pledge Updated',
        desc: 'Triggered when a member updates (upgrade, downgrade) their pledge.',
      },
      {
        value: 'members:pledge:delete',
        display_name: 'Pledge Deleted',
        desc: 'Triggered when a member deletes their pledge.',
      },
    ],
  },
} satisfies TQoreOptions;

const PledgeTrigger = QoreAppCreator.createLocalizedTrigger({
  app: PATREON_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options,
  webhook_register: RegisterPatreonWebhook,
  webhook_deregister: DeregisterPatreonWebhook,
  event_info: {
    desc: 'Patreon Pledge Event Data',
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
                    amount_cents: { type: 'integer' },
                    currency_code: { type: 'string' },
                    date: { type: 'string' },
                    pledge_payment_status: { type: 'string' },
                    payment_status: { type: 'string' },
                    tier_id: { type: 'string' },
                    tier_title: { type: 'string' },
                    type: { type: 'string' },
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
                    patron: {
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
                    tier: {
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

export default PledgeTrigger;
