import { EQoreAppActionCode, TQorePartialEventAction } from '@qoretechnologies/ts-toolkit';
import { fetchFreshdeskEventItem, FreshdeskContactEventInfo } from './constants';

export default {
  action: 'updated_contact_trigger',
  action_code: EQoreAppActionCode.EVENT,

  event_function: async (context, update, should_stop) => {
    const token = context?.conn_opts?.token;
    const subdomain = context?.conn_opts?.subdomain;

    if (!token) {
      throw new Error('The token is required to start the updated_contact_trigger event_function');
    }

    if (!subdomain) {
      throw new Error(
        'The subdomain option is required to start the updated_contact_trigger event_function'
      );
    }

    try {
      let previousContact = await getLastUpdatedContact(token, subdomain);

      while (!should_stop()) {
        const latestContact = await getLastUpdatedContact(token, subdomain);
        if (previousContact?.id !== latestContact.id) {
          update(latestContact);
        }
        previousContact = latestContact;

        await new Promise((resolve) => setTimeout(resolve, 30_000));
      }
    } catch (error) {
      throw new Error(`Error in updated_contact_trigger event_function: ${JSON.stringify(error)}`);
    }
  },

  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const subdomain = context?.conn_opts?.subdomain;

    if (!token || !subdomain) {
      throw new Error(
        'Both token and subdomain are required to get the example event data for Freshdesk updated contact trigger'
      );
    }

    const data = await getLastUpdatedContact(token, subdomain);

    return data;
  },
  event_info: FreshdeskContactEventInfo,
} satisfies TQorePartialEventAction;

const getLastUpdatedContact = async (token: string, subdomain: string): Promise<any> => {
  const data = await fetchFreshdeskEventItem({
    token,
    subdomain,
    path: '/api/v2/contacts',
    order_by: 'updated_at',
  });

  return data;
};
