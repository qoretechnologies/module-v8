import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignClient } from '../helpers/constants';
import { getActiveCampaignListAllowedValues } from '../helpers/get-list-id-allowed-values';
import { ContactNoteEventResponseType } from '../response-types/webhook-events';

const trigger = 'new_contact_note';

const options = {
  list: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignListAllowedValues,
  },
} satisfies TQoreOptions;

const ActiveCampaignNewContactNote = QoreAppCreator.createLocalizedTrigger<typeof options>({
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

    const response = await activeCampaignClient.post<{ webhook: { id: string } }>('webhooks', {
          name: `Qorus ${humanizeNameTitle(trigger)} Webhook ${new Date().getTime()}`,
          url,
          events: ['subscriber_note'],
          sources: ['public', 'admin', 'api', 'system'],
          listid: list,
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
    desc: 'Subscriber Note Webhook Event Info',
    type: ContactNoteEventResponseType,
  },
});

export default ActiveCampaignNewContactNote;
