import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignClient } from '../helpers/constants';
import { CampaignBounceEventResponseType } from '../response-types/webhook-events';

const trigger = 'new_campaign_bounce';

const ActiveCampaignNewCampaignBounce = QoreAppCreator.createLocalizedTrigger({
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

    const response = await activeCampaignClient.post<{ webhook: { id: string } }>('webhooks', {
          name: `Qorus ${humanizeNameTitle(trigger)} Webhook ${new Date().getTime()}`,
          url,
          events: ['bounce'],
          sources: ['public', 'admin', 'api', 'system'],
          }, {
        token,
        baseUrl: instance_url,
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

    await activeCampaignClient.delete(`webhooks/${webhookId}`, {
        token,
        baseUrl: instance_url,
      });
  },
  event_info: {
    desc: 'Contact Bounce Event Info',
    type: CampaignBounceEventResponseType,
  },
});

export default ActiveCampaignNewCampaignBounce;
