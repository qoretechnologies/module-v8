import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAppActionWithWebhookBase } from '../../../global/models/qore';

export const deregisterAsanaWebhook: IQoreAppActionWithWebhookBase['webhook_deregister'] = async (
  context,
  _url,
  regInfo
) => {
  const {
    conn_opts: { token },
  } = context;
  const { webhook } = regInfo;

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
