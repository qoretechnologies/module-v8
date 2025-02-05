import { EQoreAppActionCode, TQorePartialEventAction } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { fetchSalesforceObjectRecord } from '../helpers/constants';

export default {
  action: 'new_contact_trigger',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const token = context?.conn_opts?.token;
    const instance_url = context?.conn_opts?.instance_url;

    if (!token || !instance_url) {
      throw new Error('The token and instance_url are required to register Salesforce webhook');
    }

    try {
      let previousContact = await getLastCreatedContact(token, instance_url);

      while (!should_stop()) {
        const latestContact = await getLastCreatedContact(token, instance_url);
        if (previousContact?.id !== latestContact.id) {
          update(latestContact);
        }
        previousContact = latestContact;

        await new Promise((resolve) => setTimeout(resolve, 30_000));
      }
    } catch (error) {
      Debugger.log('Error in new_contact_trigger event_function', error);
    }
  },
  event_info: {
    desc: 'Salesforce New Contact Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
      },
    },
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const instance_url = context?.conn_opts?.instance_url;

    if (!token || !instance_url) {
      throw new Error(
        'The token and instance_url are required to get Salesforce new contact example data'
      );
    }

    const data = await getLastCreatedContact(token, instance_url);

    return data;
  },
} satisfies TQorePartialEventAction;

const getLastCreatedContact = async (token: string, url: string): Promise<any> => {
  const lead = await fetchSalesforceObjectRecord({
    instanceUrl: url,
    token,
    query: `SELECT FIELDS(ALL) FROM Contact ORDER BY CreatedDate DESC LIMIT 1`,
  });

  return lead;
};
