import { IQoreAppActionWithWebhookBase, QorusRequest } from '@qoretechnologies/ts-toolkit';
import axios from 'axios';
import { Debugger } from '../../../utils/Debugger';
import { TStripeEventType } from './constants';

export const deregisterStripeWebhook: IQoreAppActionWithWebhookBase['webhook_deregister'] = async (
  context,
  _url,
  regInfo
) => {
  const token = context?.conn_opts?.token;
  const { webhook } = regInfo;

  await QorusRequest.deleteReq<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/v1/webhook_endpoints/${webhook.id}`,
    },
    {
      url: 'https://api.stripe.com',
      endpointId: 'Stripe',
    }
  );
};

export const createRegisterStripeWebhookFunction = (
  enabledEvents: TStripeEventType[]
): IQoreAppActionWithWebhookBase['webhook_register'] => {
  return async (context, url) => {
    const token = context?.conn_opts?.token;

    try {
      const webhookData = new URLSearchParams();
      webhookData.append('url', url);
      enabledEvents.forEach((event) => {
        webhookData.append('enabled_events[]', event);
      });

      const { data } = await axios.post<any>(
        'https://api.stripe.com/v1/webhook_endpoints',
        webhookData,
        {
          params: {
            api_version: '2024-12-18.acacia',
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return { webhook: data };
    } catch (error) {
      Debugger.log('Error in webhook_register for stripe', error);
      throw error;
    }
  };
};

export const createGetStripeExampleEventDataFunction: (
  eventTypes: TStripeEventType[]
) => IQoreAppActionWithWebhookBase['get_example_event_data'] = (eventTypes: TStripeEventType[]) => {
  return async (context) => {
    const token = context?.conn_opts?.token;

    try {
      const params = new URLSearchParams();
      eventTypes.forEach((eventType) => {
        params.append('types[]', eventType);
      });

      const { data } = await axios.get('https://api.stripe.com/v1/events', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      return data.data[0]?.data;
    } catch (error) {
      Debugger.log('Error in get_example_event_data for stripe', error);

      return null;
    }
  };
};
