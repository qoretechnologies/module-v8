import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAppActionWithWebhookBase } from '@qoretechnologies/ts-toolkit';

export const deregisterAsanaWebhook: IQoreAppActionWithWebhookBase['webhook_deregister'] = async (
  context,
  _url,
  regInfo
) => {
  const { webhook } = regInfo;
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to deregister Asana webhook');
  }

  await QorusRequest.deleteReq<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/api/1.0/webhooks/${webhook.gid}`,
    },
    {
      url: 'https://app.asana.com',
      endpointId: 'Asana',
    }
  );
};
