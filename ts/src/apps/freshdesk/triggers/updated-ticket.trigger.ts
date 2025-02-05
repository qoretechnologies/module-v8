import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollUpdatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { fetchFreshdeskEventItem, FreshdeskTicketEventInfo } from './constants';

export default {
  action: 'updated_ticket_trigger',
  action_code: EQoreAppActionCode.EVENT,

  event_function: async (context, update, should_stop) => {
    const {
      conn_opts: { token, subdomain },
    } = context;

    const getTickets = () => {
      return getLastUpdatedTickets(token, subdomain);
    };

    await pollUpdatedItemsForTrigger({
      trigger_name: 'updated_ticket_trigger',
      uniqueField: 'id',
      updatedDateField: 'updated_at',
      getItems: getTickets,
      update,
      should_stop,
    });
  },

  get_example_event_data: async (context) => {
    const {
      conn_opts: { token, subdomain },
    } = context;

    const data = await getLastUpdatedTickets(token, subdomain);

    return data?.length > 0 ? data[0] : null;
  },
  event_info: FreshdeskTicketEventInfo,
} satisfies TQorePartialEventAction;

const getLastUpdatedTickets = async (token: string, subdomain: string): Promise<any> => {
  const data = await fetchFreshdeskEventItem<{ id: number; updated_at: string }>({
    token,
    subdomain,
    path: '/api/v2/tickets',
    order_by: 'updated_at',
    limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
  });

  return data;
};
