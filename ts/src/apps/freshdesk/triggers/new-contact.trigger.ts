import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { FRESHDESK_APP_NAME } from '../constants';
import { fetchFreshdeskEventItem, FreshdeskContactEventInfo } from './constants';

const freshDeskNewContactTrigger = QoreAppCreator.createLocalizedTrigger({
  app: FRESHDESK_APP_NAME,
  action: 'new_contact_trigger',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const token = context?.conn_opts?.token;
    const subdomain = context?.conn_opts?.subdomain;

    if (!token) {
      throw new Error('The token is required to start the new_contact_trigger event_function');
    }

    if (!subdomain) {
      throw new Error(
        'The subdomain option is required to start the new_contact_trigger event_function'
      );
    }

    const getContacts = () => {
      return getLastCreatedContacts(token, subdomain);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'new_contact_trigger',
      uniqueField: 'id',
      getItems: getContacts,
      update,
      should_stop,
    });
  },

  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const subdomain = context?.conn_opts?.subdomain;

    if (!token) {
      throw new Error(
        'The token is required to get the example event data for Freshdesk new contact trigger'
      );
    }

    if (!subdomain) {
      throw new Error(
        'The subdomain option is required to get the example event data for Freshdesk new contact trigger'
      );
    }

    const data = await getLastCreatedContacts(token, subdomain);

    return data?.length > 0 ? data[0] : null;
  },
  event_info: FreshdeskContactEventInfo,
});

const getLastCreatedContacts = async (token: string, subdomain: string) => {
  const data = await fetchFreshdeskEventItem<{ id: number }>({
    token,
    subdomain,
    path: '/api/v2/contacts',
    order_by: 'created_at',
    limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
  });

  return data;
};

export default freshDeskNewContactTrigger;
