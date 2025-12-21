import { helpScoutApiClient } from './constants';

export type THelpScoutWebhookEvent =
  | 'convo.assigned'
  | 'convo.created'
  | 'convo.deleted'
  | 'convo.merged'
  | 'convo.moved'
  | 'convo.status'
  | 'convo.tags'
  | 'convo.customer.reply.created'
  | 'convo.agent.reply.created'
  | 'convo.note.created'
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'
  | 'organization.created'
  | 'organization.updated'
  | 'organization.deleted'
  | 'satisfaction.ratings';

export type THelpScoutWebhookCreateParams = {
  token: string;
  url: string;
  events: THelpScoutWebhookEvent[];
  label?: string;
  mailboxIds?: number[];
};

export type THelpScoutWebhookResponse = {
  id: number;
  url: string;
  state: 'enabled' | 'disabled';
  events: string[];
  notification: boolean;
  payloadVersion: string;
  label?: string;
  mailboxIds?: number[];
};

export const createHelpScoutWebhook = async (
  params: THelpScoutWebhookCreateParams
): Promise<{ webhookId: string }> => {
  const { token, url, events, label, mailboxIds } = params;

  const secret = generateWebhookSecret();

  const { headers } = await helpScoutApiClient<{
    headers: {
      'resource-id': string;
    };
  }>({
    token,
    path: 'webhooks',
    method: 'POST',
    getHeaderValues: true,
    body: {
      url,
      events,
      secret,
      ...(label && { label }),
      ...(mailboxIds?.length && { mailboxIds }),
    },
  });

  return { webhookId: headers['resource-id'] };
};

export const deleteHelpScoutWebhook = async (params: {
  token: string;
  webhookId: string;
}): Promise<void> => {
  const { token, webhookId } = params;

  await helpScoutApiClient({
    token,
    path: `webhooks/${webhookId}`,
    method: 'DELETE',
  });
};

export const listHelpScoutWebhooks = async (params: {
  token: string;
}): Promise<THelpScoutWebhookResponse[]> => {
  const { token } = params;

  const response = await helpScoutApiClient<{
    _embedded?: { webhooks: THelpScoutWebhookResponse[] };
  }>({
    token,
    path: 'webhooks',
    method: 'GET',
  });

  return response._embedded?.webhooks || [];
};

export const generateWebhookSecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};
