import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAppActionWithWebhookBase } from '../../../global/models/qore';
import { ZENDESK_CONN_OPTIONS } from '..';

export const createZendeskWebhookRegistrar = (
  subscriptions: string[]
): IQoreAppActionWithWebhookBase<typeof ZENDESK_CONN_OPTIONS>['webhook_register'] => {
  return async (context, url) => {
    const {
      conn_opts: { token, subdomain },
    } = context;

    const {
      data: { webhook },
    } = await QorusRequest.post<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          webhook: {
            name: 'New Organization Webhook',
            status: 'active',
            endpoint: url,
            http_method: 'POST',
            request_format: 'json',
            subscriptions,
          },
        },
        path: '/api/v2/webhooks',
      },
      { url: `https://${subdomain}.zendesk.com`, endpointId: 'Zendesk' }
    );

    return webhook;
  };
};

export const createZendeskWebhookDeRegistrar = (): IQoreAppActionWithWebhookBase<
  typeof ZENDESK_CONN_OPTIONS
>['webhook_deregister'] => {
  return async (context, _url) => {
    const {
      conn_opts: { token, subdomain },
      opts: { webhook },
    } = context;

    await QorusRequest.deleteReq<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: `/api/v2/webhooks/${webhook.id}`,
      },
      { url: `https://${subdomain}.zendesk.com`, endpointId: 'Zendesk' }
    );
  };
};
