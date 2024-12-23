import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAppActionWithWebhookBase } from '../../../global/models/qore';

export const deregisterJiraWebhook: IQoreAppActionWithWebhookBase['webhook_deregister'] = async (
  context,
  _url,
  regInfo
) => {
  const {
    conn_opts: { token, cloud_id },
  } = context;
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
