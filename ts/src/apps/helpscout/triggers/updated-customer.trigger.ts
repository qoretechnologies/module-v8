import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { HELPSCOUT_APP_NAME, HelpScoutError } from '../constants';
import { fetchHelpScoutPaginatedRecords } from '../helpers/constants';
import { createHelpScoutWebhook, deleteHelpScoutWebhook } from '../helpers/webhook-helper';
import { HelpScoutCustomerWebhookResponseType } from '../response-types/customer';

const trigger = 'updated_customer';

const options = {} satisfies TQoreOptions;

const HelpScoutUpdatedCustomer = QoreAppCreator.createLocalizedTrigger<typeof options>({
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

    const { webhookId } = await createHelpScoutWebhook({
      token,
      url,
      events: ['customer.updated'],
      label: `Qorus Updated Customer Webhook`,
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

    const customers = await fetchHelpScoutPaginatedRecords({
      token,
      path: 'customers',
      object: 'customers',
      maxResults: 1,
      limit: 1,
    });

    return customers[0] || {};
  },
  event_info: {
    desc: 'Updated Customer data',
    type: HelpScoutCustomerWebhookResponseType,
  },
});

export default HelpScoutUpdatedCustomer;
