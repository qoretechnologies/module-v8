import {
  QorusRequest,
  TCustomConnOptions,
  TWebhookDeregisterFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AttioEndpointData, AttioError } from '../constants';

export const deregisterAttioWebhook: TWebhookDeregisterFunction<TCustomConnOptions> = async (
  context,
  _url,
  regInfo: { webhook: { id: string } }
) => {
  const { webhook } = regInfo;
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: AttioError,
  });

  if (!webhook || !webhook.id) {
    throw new Error('Invalid webhook information for deregistration');
  }

  await QorusRequest.deleteReq<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/v2/webhooks/${webhook.id}`,
    },
    AttioEndpointData
  );
};
