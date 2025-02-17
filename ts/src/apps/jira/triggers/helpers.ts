import { IQoreAppActionWithWebhookBase, QorusRequest } from '@qoretechnologies/ts-toolkit';

export const deregisterJiraWebhook: IQoreAppActionWithWebhookBase['webhook_deregister'] = async (
  context,
  _url,
  regInfo
) => {
  const token = context?.conn_opts?.token;
  const cloud_id = context?.conn_opts?.cloud_id;

  if (!token || !cloud_id) {
    throw new Error('The token and cloud_id are required to deregister Jira webhook');
  }

  const { webhook } = regInfo;

  await QorusRequest.deleteReq<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        webhookIds: [webhook.id],
      },
      path: `/ex/jira/${cloud_id}/rest/api/3/webhook`,
    },
    {
      url: 'https://api.atlassian.com',
      endpointId: 'Stripe',
    }
  );
};
