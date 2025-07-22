import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';

const trigger = 'new_campaign_link_click';

const ActiveCampaignNewCampaignLinkClick = QoreAppCreator.createLocalizedTrigger({
  action: trigger,
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: async (context, url) => {
    const { token, instance_url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'instance_url'],
      ErrorClass: ActiveCampaignError,
    });

    const response = await activeCampaignApiClient<{ webhook: { id: string } }>({
      method: 'POST',
      token,
      url: instance_url,
      path: 'webhooks',
      body: {
        name: `Qorus ${humanizeNameTitle(trigger)} Webhook ${new Date().getTime()}`,
        url,
        events: ['click'],
        sources: ['public', 'admin', 'api', 'system'],
      },
    });

    return response;
  },
  webhook_deregister: async (context, _url, regInfo) => {
    const { token, instance_url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'instance_url'],
      ErrorClass: ActiveCampaignError,
    });
    const webhookId = regInfo.webhook.id;

    if (!webhookId) {
      throw new ActiveCampaignError('Webhook ID is required for deregistration.');
    }

    await activeCampaignApiClient({
      method: 'DELETE',
      token,
      url: instance_url,
      path: `webhooks/${webhookId}`,
    });
  },

  event_info: {
    desc: 'Webhook Event Info',
    type: {
      type: 'hash',
      fields: {
        url: { type: 'string' },
        type: { type: 'string' },
        date_time: { type: 'string' },
        initiated_by: { type: 'string' },
        list: { type: 'string' },
        campaign: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
            },
          },
        },
        link: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
        contact: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              email: { type: 'string' },
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              phone: { type: 'string' },
              tags: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              orgname: { type: 'string' },
              ip: { type: 'string' },
              fields: {
                type: {
                  type: 'hash',
                },
              },
            },
          },
        },
      },
    },
  },
});

export default ActiveCampaignNewCampaignLinkClick;
