import { QorusRequest, TWebhookDeregisterFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AZURE_DEVOPS_API_VERSION, AZURE_DEVOPS_APP_NAME, AzureDevOpsError } from '../constants';

export const DeregisterAzureDevOpsWebhook: TWebhookDeregisterFunction = async (
  context,
  _url,
  regInfo
) => {
  const { token, organization } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'organization'],
    ErrorClass: AzureDevOpsError,
  });

  try {
    const subscriptionId = regInfo?.subscriptionId;

    if (!subscriptionId) {
      throw new AzureDevOpsError('No subscription ID found in registration info');
    }

    await QorusRequest.deleteReq(
      {
        path: `/_apis/hooks/subscriptions/${subscriptionId}`,
        params: {
          'api-version': AZURE_DEVOPS_API_VERSION,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
      {
        url: `https://dev.azure.com/${organization}`,
        endpointId: AZURE_DEVOPS_APP_NAME,
      }
    );
  } catch (error) {
    throw new AzureDevOpsError(`Failed to deregister webhook : ${error.message || error}`);
  }
};
