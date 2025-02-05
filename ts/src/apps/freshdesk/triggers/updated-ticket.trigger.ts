import { EQoreAppActionCode, TQorePartialEventAction } from '@qoretechnologies/ts-toolkit';
import { fetchFreshdeskEventItem, FreshdeskTicketEventInfo } from './constants';

export default {
  action: 'updated_ticket_trigger',
  action_code: EQoreAppActionCode.EVENT,

  event_function: async (context, update, should_stop) => {
    const token = context?.conn_opts?.token;
    const subdomain = context?.conn_opts?.subdomain;

    if (!token || !subdomain) {
      throw new Error(
        'Both token and subdomain are required to start the updated_ticket_trigger event_function'
      );
    }

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
    const token = context?.conn_opts?.token;
    const subdomain = context?.conn_opts?.subdomain;

    if (!token || !subdomain) {
      throw new Error(
        'Both token and subdomain are required to get the example event data for Freshdesk updated ticket trigger'
      );
    }

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
