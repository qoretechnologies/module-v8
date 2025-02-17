import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollUpdatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { FRESHDESK_APP_NAME } from '../constants';
import { fetchFreshdeskEventItem, FreshdeskContactEventInfo } from './constants';

const freshDeskUpdateContactTrigger = QoreAppCreator.createLocalizedTrigger({
  app: FRESHDESK_APP_NAME,
  action: 'updated_contact_trigger',
  action_code: EQoreAppActionCode.EVENT,

  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const subdomain = context.conn_opts?.subdomain;

    if (!token) {
      throw new Error('The token is required to start the updated_contact_trigger event_function');
    }

    if (!subdomain) {
      throw new Error(
        'The subdomain option is required to start the updated_contact_trigger event_function'
      );
    }

    const getContacts = () => {
      return getLastUpdatedContacts(token, subdomain);
    };

    await pollUpdatedItemsForTrigger({
      trigger_name: 'updated_contact_trigger',
      uniqueField: 'id',
      updatedDateField: 'updated_at',
      getItems: getContacts,
      update,
      should_stop,
    });
  },

  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const subdomain = context?.conn_opts?.subdomain;

    if (!token || !subdomain) {
      throw new Error(
        'Both token and subdomain are required to get the example event data for Freshdesk updated contact trigger'
      );
    }

    const data = await getLastUpdatedContacts(token, subdomain);

    return data?.length > 0 ? data[0] : null;
  },
  event_info: FreshdeskContactEventInfo,
});

const getLastUpdatedContacts = async (token: string, subdomain: string): Promise<any> => {
  const data = await fetchFreshdeskEventItem<{ id: number; updated_at: string }>({
    token,
    subdomain,
    path: '/api/v2/contacts',
    order_by: 'updated_at',
    limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
  });

  return data;
};

export default freshDeskUpdateContactTrigger;
