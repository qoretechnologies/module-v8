import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { fetchFreshdeskEventItem, FreshdeskTicketEventInfo } from './constants';

export default {
  action: 'updated_ticket_trigger',
  action_code: EQoreAppActionCode.EVENT,

  event_function: async (context, update, should_stop) => {
    const {
      conn_opts: { token, subdomain },
    } = context;

    try {
      let previousTicket = await getLastUpdatedTicket(token, subdomain);

      while (!should_stop()) {
        const latestTicket = await getLastUpdatedTicket(token, subdomain);
        if (previousTicket?.id !== latestTicket.id) {
          update(latestTicket);
        }
        previousTicket = latestTicket;

        await new Promise((resolve) => setTimeout(resolve, 30_000));
      }
    } catch (error) {
      console.error('Error in updated_ticket_trigger event_function', error);
    }
  },

  get_example_event_data: async (context) => {
    const {
      conn_opts: { token, subdomain },
    } = context;

    const data = await getLastUpdatedTicket(token, subdomain);

    return data;
  },
  event_info: FreshdeskTicketEventInfo,
} satisfies TQorePartialEventAction;

const getLastUpdatedTicket = async (token: string, subdomain: string): Promise<any> => {
  const data = await fetchFreshdeskEventItem({
    token,
    subdomain,
    path: '/api/v2/tickets',
    order_by: 'updated_at',
  });

  return data;
};
