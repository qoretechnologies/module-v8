import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignListAllowedValues } from '../helpers/get-list-id-allowed-values';

const trigger = 'new_deal';

const options = {
  list: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignListAllowedValues,
  },
} satisfies TQoreOptions;

const ActiveCampaignNewDeal = QoreAppCreator.createLocalizedTrigger<typeof options>({
  action: trigger,
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options,
  webhook_register: async (context, url) => {
    const { token, instance_url, list } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'instance_url'],
      optionFields: ['list'],
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
        events: ['deal_add'],
        sources: ['public', 'admin', 'api', 'system'],
        listid: list,
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
    desc: 'Deal Add Webhook Event Info',
    type: {
      type: 'hash',
      fields: {
        url: { type: 'string' },
        type: { type: 'string' },
        date_time: { type: 'string' },
        initiated_by: { type: 'string' },
        list: { type: 'string' },
        deal: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              title: { type: 'string' },
              create_date: { type: 'string' },
              orgid: { type: 'string' },
              orgname: { type: 'string' },
              stageid: { type: 'string' },
              stage_title: { type: 'string' },
              pipelineid: { type: 'string' },
              pipeline_title: { type: 'string' },
              value: { type: 'string' },
              currency: { type: 'string' },
              currency_symbol: { type: 'string' },
              owner: { type: 'string' },
              owner_firstname: { type: 'string' },
              owner_lastname: { type: 'string' },
              contactid: { type: 'string' },
              contact_email: { type: 'string' },
              contact_firstname: { type: 'string' },
              contact_lastname: { type: 'string' },
              status: { type: 'string' },
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
            },
          },
        },
      },
    },
  },
});

export default ActiveCampaignNewDeal;
