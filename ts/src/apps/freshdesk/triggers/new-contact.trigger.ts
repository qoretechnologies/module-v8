import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { fetchFreshdeskEventItem, FreshdeskContactEventInfo } from './constants';

export default {
  action: 'new_contact_trigger',
  action_code: EQoreAppActionCode.EVENT,

  event_function: async (context, update, should_stop) => {
    const {
      conn_opts: { token, subdomain },
    } = context;

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
    const {
      conn_opts: { token, subdomain },
    } = context;

    const data = await getLastCreatedContacts(token, subdomain);

    return data?.length > 0 ? data[0] : null;
  },
  event_info: FreshdeskContactEventInfo,
} satisfies TQorePartialEventAction;

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
