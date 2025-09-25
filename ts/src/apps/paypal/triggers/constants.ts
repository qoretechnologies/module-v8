import {
  QorusRequest,
  TCustomConnOptions,
  TQoreAppActionFunctionContext,
  TWebhookDeregisterFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { getPayPalErrorMessage, PAYPAL_APP_NAME, PayPalError } from '../constants';
import { payPalApiClient } from '../helpers/constants';

export const DeregisterPayPalWebhook: TWebhookDeregisterFunction = async (
  context,
  _url,
  regInfo
) => {
  const { token, environment } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'environment'],
    ErrorClass: PayPalError,
  });

  try {
    const webhookId = regInfo?.webhookId;

    if (!webhookId) {
      throw new PayPalError('No webhook ID found in registration info');
    }

    await QorusRequest.deleteReq(
      {
        path: `/v1/notifications/webhooks/${webhookId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
      {
        url: `https://${environment}.paypal.com`,
        endpointId: PAYPAL_APP_NAME,
      }
    );
  } catch (error) {
    throw new PayPalError(`Failed to deregister webhook : ${getPayPalErrorMessage(error)}`);
  }
};

type TQoreGetExampleEventDataFunction = (
  context: TQoreAppActionFunctionContext<TCustomConnOptions, Record<string, any>>
) => Record<string, any> | Promise<Record<string, any>>;

const ResourceVersionToEventNameMap: Record<string, string[]> = {
  '1.0': [
    'CUSTOMER.DISPUTE.UPDATED',
    'CUSTOMER.DISPUTE.CREATED',
    'CUSTOMER.DISPUTE.RESOLVED',
    'INVOICING.INVOICE.CANCELLED',
    'INVOICING.INVOICE.CREATED',
    'INVOICING.INVOICE.UPDATED',
    'INVOICING.INVOICE.PAID',
    'INVOICING.INVOICE.REFUNDED',
    'INVOICING.INVOICE.SCHEDULED',
  ],
  '2.0': [
    'CHECKOUT.ORDER.APPROVED',
    'CHECKOUT.ORDER.COMPLETED',
    'CHECKOUT.ORDER.PAYER-ADDED',
    'BILLING.SUBSCRIPTION.CREATED',
    'BILLING.SUBSCRIPTION.ACTIVATED',
    'BILLING.SUBSCRIPTION.UPDATED',
    'BILLING.SUBSCRIPTION.EXPIRED',
    'BILLING.SUBSCRIPTION.CANCELLED',
    'BILLING.SUBSCRIPTION.SUSPENDED',
  ],
};

export const getPayPalWebhookExampleDataFunction = (
  actionName: string,
  eventName?: string
): TQoreGetExampleEventDataFunction => {
  return async (context) => {
    const { token, environment } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'environment'],
      ErrorClass: PayPalError,
    });

    const event = eventName || context?.opts?.event_name;

    if (!event) {
      throw new PayPalError(`No event name provided for ${humanizeNameTitle(actionName)}`);
    }

    const resourceVersion = Object.entries(ResourceVersionToEventNameMap).find(([_, events]) =>
      events.includes(event)
    )?.[0];

    try {
      const response = await payPalApiClient({
        token,
        environment,
        path: 'notifications/simulate-event',
        method: 'POST',
        body: {
          event_type: event,
          resource_version: resourceVersion,
          url: 'https://example.com/webhook',
        },
      });

      return response;
    } catch (error) {
      throw new PayPalError(
        `Failed to get example event data for ${humanizeNameTitle(actionName)}: ${getPayPalErrorMessage(error)}`
      );
    }
  };
};
