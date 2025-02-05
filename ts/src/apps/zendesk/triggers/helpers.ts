import { IQoreAppActionWithWebhookBase, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ZENDESK_CONN_OPTIONS } from '..';

export const createZendeskWebhookRegistrar = (
  webhookName: string,
  subscriptions: string[]
): IQoreAppActionWithWebhookBase<typeof ZENDESK_CONN_OPTIONS>['webhook_register'] => {
  return async (context, url) => {
    const token = context?.conn_opts?.token;
    const subdomain = context?.conn_opts?.subdomain;

    if (!token || !subdomain) {
      throw new Error('The token and subdomain are required to register a Zendesk webhook');
    }

    const { data } = await QorusRequest.post<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          webhook: {
            name: `${webhookName} Webhook created by Qorus`,
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

    return data;
  };
};

export const createZendeskWebhookDeRegistrar = (): IQoreAppActionWithWebhookBase<
  typeof ZENDESK_CONN_OPTIONS
>['webhook_deregister'] => {
  return async (context, _url, regInfo) => {
    const token = context?.conn_opts?.token;
    const subdomain = context?.conn_opts?.subdomain;

    if (!token || !subdomain) {
      throw new Error('The token and subdomain are required to deregister a Zendesk webhook');
    }
    const { webhook } = regInfo;

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
