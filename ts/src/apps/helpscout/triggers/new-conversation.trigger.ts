import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { HELPSCOUT_APP_NAME, HelpScoutError } from '../constants';
import { fetchHelpScoutPaginatedRecords } from '../helpers/constants';
import { getHelpScoutMailboxAllowedValues } from '../helpers/get-mailbox-allowed-values';
import { createHelpScoutWebhook, deleteHelpScoutWebhook } from '../helpers/webhook-helper';
import { HelpScoutConversationResponseType } from '../response-types/conversation';

const trigger = 'new_conversation';

const options = {
  mailboxId: {
    type: 'integer',
    required: false,
    get_allowed_values: getHelpScoutMailboxAllowedValues,
  },
} satisfies TQoreOptions;

const HelpScoutNewConversation = QoreAppCreator.createLocalizedTrigger<typeof options>({
  action: trigger,
  app: HELPSCOUT_APP_NAME,
  action_code: EQoreAppActionCode.EVENT,
  options,
  webhook_method: 'POST',
  webhook_register: async (context, url) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    const mailboxId = context?.opts?.mailboxId;

    const { webhookId } = await createHelpScoutWebhook({
      token,
      url,
      events: ['convo.created'],
      label: `Qorus New Conversation Webhook`,
      ...(mailboxId && { mailboxIds: [mailboxId] }),
    });

    return { webhook_id: webhookId };
  },
  webhook_deregister: async (context, _url, regInfo) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    const webhookId = regInfo?.webhook_id;

    if (!webhookId) {
      throw new HelpScoutError('Webhook ID is required for deregistration.');
    }

    await deleteHelpScoutWebhook({
      token,
      webhookId,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    const conversations = await fetchHelpScoutPaginatedRecords({
      token,
      path: 'conversations',
      object: 'conversations',
      maxResults: 1,
      limit: 1,
    });

    return conversations[0] || {};
  },
  event_info: {
    desc: 'New Conversation data',
    type: HelpScoutConversationResponseType,
  },
});

export default HelpScoutNewConversation;
