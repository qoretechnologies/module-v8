import {
  EQoreAppActionCode,
  IQoreAppActionWithWebhookBase,
  QoreAppCreator,
  QorusRequest,
} from '@qoretechnologies/ts-toolkit';
import { ZENDESK_APP_NAME, ZENDESK_CONN_OPTIONS } from '..';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ZendeskError } from '../constants';
import { zendeskApiClient } from '../helpers/constants';

const createZendeskNewTicketWebhookRegistrar = (): IQoreAppActionWithWebhookBase<
  typeof ZENDESK_CONN_OPTIONS
>['webhook_register'] => {
  return async (context, url) => {
    const token = context?.conn_opts?.token;
    const subdomain = context?.conn_opts?.subdomain;

    if (!token || !subdomain) {
      throw new Error('The token and subdomain are required to register a Zendesk webhook');
    }

    const zendeskUrl = `https://${subdomain}.zendesk.com`;
    const {
      data: { webhook },
    } = await QorusRequest.post<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          webhook: {
            name: 'New Ticket Webhook created by Qorus',
            status: 'active',
            endpoint: url,
            http_method: 'POST',
            request_format: 'json',
            subscriptions: ['conditional_ticket_events'],
          },
        },
        path: '/api/v2/webhooks',
      },
      { url: zendeskUrl, endpointId: 'Zendesk' }
    );

    const triggerData = {
      ticket_id: '{{ticket.id}}',
      ticket_subject: '{{ticket.title}}',
      ticket_description: '{{ticket.description}}',
      ticket_priority: '{{ticket.priority}}',
      ticket_status: '{{ticket.status}}',
      ticket_type: '{{ticket.type}}',
      ticket_url: '{{ticket.url}}',
      requester_name: '{{ticket.requester.name}}',
      requester_email: '{{ticket.requester.email}}',
      assignee_name: '{{ticket.assignee.name}}',
      assignee_email: '{{ticket.assignee.email}}',
      group_name: '{{ticket.group.name}}',
      organization_name: '{{ticket.organization.name}}',
      tags: '{{ticket.tags}}',
    };

    const {
      data: { trigger },
    } = await QorusRequest.post<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          trigger: {
            title: 'Notify Webhook on Ticket Creation',
            conditions: {
              all: [
                {
                  field: 'update_type',
                  operator: 'is',
                  value: 'Create',
                },
              ],
            },
            actions: [
              {
                field: 'notification_webhook',
                value: [webhook.id, JSON.stringify(triggerData)],
              },
            ],
          },
        },
        path: '/api/v2/triggers',
      },
      { url: `https://${subdomain}.zendesk.com`, endpointId: 'Zendesk' }
    );

    return { webhook, trigger };
  };
};

export const createZendeskNewTicketWebhookDeRegistrar = (): IQoreAppActionWithWebhookBase<
  typeof ZENDESK_CONN_OPTIONS
>['webhook_deregister'] => {
  return async (context, _url, regInfo) => {
    const token = context?.conn_opts?.token;
    const subdomain = context?.conn_opts?.subdomain;

    if (!token || !subdomain) {
      throw new Error(
        'Token and subdomain are required to deregister a webhook for Zendesk new ticket trigger'
      );
    }

    const zendeskUrl = `https://${subdomain}.zendesk.com`;
    const { webhook, trigger } = regInfo;

    await Promise.all([
      QorusRequest.deleteReq<any>(
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          path: `/api/v2/webhooks/${webhook.id}`,
        },
        { url: zendeskUrl, endpointId: 'Zendesk' }
      ),
      QorusRequest.deleteReq<any>(
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          path: `/api/v2/triggers/${trigger.id}`,
        },
        { url: zendeskUrl, endpointId: 'Zendesk' }
      ),
    ]);
  };
};

const zendeskNewTicketTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ZENDESK_APP_NAME,
  action: 'new_ticket',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createZendeskNewTicketWebhookRegistrar(),
  webhook_deregister: createZendeskNewTicketWebhookDeRegistrar(),
  get_example_event_data: async (context) => {
    const { token, url, subdomain } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url', 'subdomain'],
      ErrorClass: ZendeskError,
    });

    try {
      const response = await zendeskApiClient<{
        tickets: Array<{
          id: number;
          subject: string;
          description: string;
          priority: string | null;
          status: string;
          type: string | null;
          url: string;
          requester_id: number;
          assignee_id: number | null;
          group_id: number | null;
          organization_id: number | null;
          tags: string[];
        }>;
      }>({
        path: 'tickets.json',
        method: 'GET',
        token,
        url,
        params: {
          per_page: '1',
          sort_by: 'created_at',
          sort_order: 'desc',
        },
      });

      const ticket = response?.tickets?.[0];
      if (!ticket) {
        return null;
      }

      // Fetch related entities in parallel
      const [requester, assignee, group, organization] = await Promise.all([
        ticket.requester_id
          ? zendeskApiClient<{ user: { name: string; email: string } }>({
              path: `users/${ticket.requester_id}.json`,
              method: 'GET',
              token,
              url,
            }).catch(() => null)
          : null,
        ticket.assignee_id
          ? zendeskApiClient<{ user: { name: string; email: string } }>({
              path: `users/${ticket.assignee_id}.json`,
              method: 'GET',
              token,
              url,
            }).catch(() => null)
          : null,
        ticket.group_id
          ? zendeskApiClient<{ group: { name: string } }>({
              path: `groups/${ticket.group_id}.json`,
              method: 'GET',
              token,
              url,
            }).catch(() => null)
          : null,
        ticket.organization_id
          ? zendeskApiClient<{ organization: { name: string } }>({
              path: `organizations/${ticket.organization_id}.json`,
              method: 'GET',
              token,
              url,
            }).catch(() => null)
          : null,
      ]);

      return {
        ticket_id: String(ticket.id),
        ticket_subject: ticket.subject || '',
        ticket_description: ticket.description || '',
        ticket_priority: ticket.priority || '',
        ticket_status: ticket.status || '',
        ticket_type: ticket.type || '',
        ticket_url: `https://${subdomain}.zendesk.com/agent/tickets/${ticket.id}`,
        requester_name: requester?.user?.name || '',
        requester_email: requester?.user?.email || '',
        assignee_name: assignee?.user?.name || '',
        assignee_email: assignee?.user?.email || '',
        group_name: group?.group?.name || '',
        organization_name: organization?.organization?.name || '',
        tags: ticket.tags?.join(', ') || '',
      };
    } catch (error) {
      throw new ZendeskError(`Failed to fetch example ticket data: ${error}`);
    }
  },
  event_info: {
    desc: 'New Ticket event data',
    type: {
      type: 'hash',
      fields: {
        assignee_email: {
          type: 'softstring',
        },
        assignee_name: {
          type: 'softstring',
        },
        group_name: {
          type: 'softstring',
        },
        organization_name: {
          type: 'softstring',
        },
        requester_email: {
          type: 'softstring',
        },
        requester_name: {
          type: 'softstring',
        },
        tags: {
          type: 'softstring',
        },
        ticket_description: {
          type: 'softstring',
        },
        ticket_id: {
          type: 'softstring',
        },
        ticket_priority: {
          type: 'softstring',
        },
        ticket_status: {
          type: 'softstring',
        },
        ticket_subject: {
          type: 'softstring',
        },
        ticket_type: {
          type: 'softstring',
        },
        ticket_url: {
          type: 'softstring',
        },
      },
    },
  },
});

export default zendeskNewTicketTrigger;
