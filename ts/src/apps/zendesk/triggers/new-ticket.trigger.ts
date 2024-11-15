import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ZENDESK_CONN_OPTIONS } from '..';
import {
  EQoreAppActionCode,
  IQoreAppActionWithWebhookBase,
  TQorePartialEventAction,
} from '../../../global/models/qore';

const createZendeskNewTicketWebhookRegistrar = (): IQoreAppActionWithWebhookBase<
  typeof ZENDESK_CONN_OPTIONS
>['webhook_register'] => {
  return async (context, url) => {
    //console.log(`webhook URL: ${url}`);
    const {
      conn_opts: { token, subdomain },
    } = context;
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

    //console.log(`webhook => ${JSON.stringify(webhook)}`);

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
    const {
      conn_opts: { token, subdomain },
    } = context;
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

export default {
  action: 'new_ticket',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  webhook_register: createZendeskNewTicketWebhookRegistrar(),
  webhook_deregister: createZendeskNewTicketWebhookDeRegistrar(),
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
} satisfies TQorePartialEventAction;
