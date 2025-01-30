import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { fetchFreshdeskEventItem, FreshdeskContactEventInfo } from './constants';

export default {
  action: 'new_contact_trigger',
  action_code: EQoreAppActionCode.EVENT,

  event_function: async (context, update, should_stop) => {
    const {
      conn_opts: { token, subdomain },
    } = context;

    try {
      let previousContact = await getLastCreatedContact(token, subdomain);

      while (!should_stop()) {
        const latestContact = await getLastCreatedContact(token, subdomain);
        if (previousContact?.id !== latestContact.id) {
          update(latestContact);
        }
        previousContact = latestContact;

        await new Promise((resolve) => setTimeout(resolve, 30_000));
      }
    } catch (error) {
      console.error('Error in new_contact_trigger event_function', error);
    }
  },

  get_example_event_data: async (context) => {
    const {
      conn_opts: { token, subdomain },
    } = context;

    const data = await getLastCreatedContact(token, subdomain);

    return data;
  },
  event_info: FreshdeskContactEventInfo,
} satisfies TQorePartialEventAction;

const getLastCreatedContact = async (token: string, subdomain: string): Promise<any> => {
  const data = await fetchFreshdeskEventItem({
    token,
    subdomain,
    path: '/api/v2/contacts',
    order_by: 'created_at',
  });

  return data;
};
