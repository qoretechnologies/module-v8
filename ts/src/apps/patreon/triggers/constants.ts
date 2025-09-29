import {
  QorusRequest,
  TWebhookDeregisterFunction,
  TWebhookRegisterFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PATREON_APP_NAME, PatreonError } from '../constants';
import { createPatreonClient } from '../helpers/constants';

export const DeregisterPatreonWebhook: TWebhookDeregisterFunction = async (
  context,
  _url,
  regInfo
) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: PatreonError,
  });

  try {
    const webhookId = regInfo?.webhookId;

    if (!webhookId) {
      throw new PatreonError('No webhook ID found in registration info');
    }

    await QorusRequest.deleteReq(
      {
        path: `/api/oauth2/v2/webhooks/${webhookId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
      {
        url: `https://patreon.com`,
        endpointId: PATREON_APP_NAME,
      }
    );
  } catch (error) {
    throw new PatreonError(`Failed to deregister webhook : ${error?.message || error}`);
  }
};

export const RegisterPatreonWebhook: TWebhookRegisterFunction = async (context, url) => {
  const { token, campaignId, trigger } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['campaignId', 'trigger'],
    ErrorClass: PatreonError,
  });

  try {
    const client = createPatreonClient(token);

    const response = await client.webhooks.createWebhook({
      uri: url,
      triggers: [trigger],
      campaignId,
    });

    return {
      webhookId: response.data.id,
    };
  } catch (error) {
    throw new PatreonError(`Failed to register webhook : ${error?.message || error}`);
  }
};
