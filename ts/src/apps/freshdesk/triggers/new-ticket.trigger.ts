import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { FRESHDESK_APP_NAME } from '../constants';
import {
  FreshdeskTicketPriorityAllowedValues,
  FreshdeskTicketStatusAllowedValues,
  getFreshdeskTicketPriorityAllowedValues,
  getFreshdeskTicketStatusAllowedValues,
} from '../helpers/get-ticket-allowed-values';

type TTicket = {
  id: string;
  subject: string;
  description: string;
  status: number;
  priority: number;
  due_by: string;
  source: number;
  type: number;
};

const mapTicketToEventTicket = (ticket: TTicket, subdomain: string) => {
  return {
    ticket_id: ticket.id,
    ticket_subject: ticket.subject,
    ticket_description: ticket.description,
    ticket_url: `https://${subdomain}.freshdesk.com/helpdesk/tickets/${ticket.id}`,
    ticket_due_by_time: ticket.due_by,
    ticket_status:
      FreshdeskTicketStatusAllowedValues.find((status) => status.value === ticket.status)
        ?.display_name || ticket.status,
    ticket_priority:
      FreshdeskTicketPriorityAllowedValues.find((priority) => priority.value === ticket.priority)
        ?.display_name || ticket.priority,
    ticket_source: ticket.source,
    ticket_ticket_type: ticket.type,
  };
};

const FreshdeskNewTicketTrigger = QoreAppCreator.createLocalizedTrigger({
  app: FRESHDESK_APP_NAME,
  action: 'new_ticket_trigger',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    ticketStatus: {
      required: true,
      type: {
        type: 'list',
        element_type: 'softnumber',
      },
      get_allowed_values: getFreshdeskTicketStatusAllowedValues,
      default_value: [2],
    },
    ticketPriority: {
      required: false,
      type: {
        type: 'list',
        element_type: 'softnumber',
      },
      get_allowed_values: getFreshdeskTicketPriorityAllowedValues,
    },
  },
  webhook_method: 'POST',
  webhook_register: async (context, url) => {
    const token = context?.conn_opts?.token;
    const subdomain = context?.conn_opts?.subdomain;
    const ticketStatus = context?.opts?.ticketStatus;
    const ticketPriority = context?.opts?.ticketPriority || [];

    if (!token || !subdomain || !ticketStatus) {
      throw new Error(
        'Token, subdomain and ticket status are required to register a webhook for Freshdesk new ticket trigger'
      );
    }

    const response = await QorusRequest.post<{ data: { name: string; id: number } }>(
      {
        path: '/api/v2/automations/1/rules',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          name: 'Qorus New Ticket Trigger ',
          active: true,
          conditions: [
            {
              name: 'condition_set_1',
              match_type: 'any',
              properties: [
                {
                  field_name: 'status',
                  resource_type: 'ticket',
                  operator: 'in',
                  value: ticketStatus,
                },
                ...(ticketPriority.length
                  ? [
                      {
                        field_name: 'priority',
                        resource_type: 'ticket',
                        operator: 'in',
                        value: ticketPriority,
                      },
                    ]
                  : []),
              ],
            },
          ],
          actions: [
            {
              field_name: 'trigger_webhook',
              request_type: 'POST',
              url,
              content_layout: '1',
              content_type: 'JSON',
              content: {
                ticket_id: '{{ticket.id}}',
                ticket_subject: '{{ticket.subject}}',
                ticket_description: '{{ticket.description}}',
                ticket_url: '{{ticket.url}}',
                ticket_due_by_time: '{{ticket.due_by_time}}',
                ticket_status: '{{ticket.status}}',
                ticket_priority: '{{ticket.priority}}',
                ticket_source: '{{ticket.source}}',
                ticket_ticket_type: '{{ticket.ticket_type}}',
              },
            },
          ],
        },
      },
      { url: `https://${subdomain}.freshdesk.com`, endpointId: 'Freshdesk' }
    );

    const responseData = response?.data;

    if (!responseData) return;

    return { webhook: responseData };
  },
  webhook_deregister: async (context, _url, regInfo) => {
    const token = context?.conn_opts?.token;
    const subdomain = context?.conn_opts?.subdomain;

    if (!token || !subdomain) {
      throw new Error(
        'Token and subdomain are required to deregister a webhook for Freshdesk new ticket trigger'
      );
    }

    const { webhook } = regInfo;

    await QorusRequest.deleteReq<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: `/api/v2/automations/1/rules/${webhook.id}`,
      },
      { url: `https://${subdomain}.freshdesk.com`, endpointId: 'Freshdesk' }
    );
  },

  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const subdomain = context?.conn_opts?.subdomain;

    if (!token || !subdomain) {
      throw new Error(
        'Failed to get example data for Freshdesk new ticket trigger. Token or subdomain are missing'
      );
    }

    const response = await QorusRequest.get<{
      data: TTicket[];
    }>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: '/api/v2/tickets',
        params: {
          per_page: '1',
          order_by: 'created_at',
          order_type: 'desc',
        },
      },
      { url: `https://${subdomain}.freshdesk.com`, endpointId: 'Freshdesk' }
    );

    const responseData = response?.data;

    if (!responseData?.length) {
      return;
    }

    return mapTicketToEventTicket(responseData[0], subdomain);
  },

  event_info: {
    desc: 'New ticket created event data',
    type: {
      type: 'hash',
      fields: {
        ticket_id: { type: 'softstring' },
        ticket_subject: { type: 'softstring' },
        ticket_description: { type: 'softstring' },
        ticket_url: { type: 'softstring' },
        ticket_due_by_time: { type: 'softstring' },
        ticket_status: { type: 'softstring' },
        ticket_priority: { type: 'softstring' },
        ticket_source: { type: 'softstring' },
        ticket_ticket_type: { type: 'softstring' },
      },
    },
  },
});

export default FreshdeskNewTicketTrigger;
