import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { delay } from '../../../global/helpers';
import { STRIPE_ALLOWED_VALUES_FETCH_DELAY, STRIPE_ALLOWED_VALUES_TIMEOUT } from './constants';

type TStripePaymentIntentItem = {
  id: string;
  object: string;
  amount: number;
  created: number;
};

type TStripePaymentIntentData = {
  data: TStripePaymentIntentItem[];
  hasMore: boolean;
};

const fetchStripePaymentIntents = async ({
  token,
  lastItemId,
}: {
  token: string;
  lastItemId?: string | null;
}): Promise<TStripePaymentIntentData> => {
  const path = `/v1/payment_intents${lastItemId ? `?starting_after=${lastItemId}` : ''}`;
  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path,
    },
    { url: 'https://api.stripe.com', endpointId: 'Stripe' }
  );

  return { data: data.data, hasMore: data.hasMore };
};

const mapStripePaymentIntent = (item: TStripePaymentIntentItem): IQoreAllowedValue => ({
  value: item.id,
  display_name: `${item.object} - ${item.amount}`,
  desc:
    `id: ${item.id}\n\nObject:${item.object}\n\nAmount:${item.amount}\n\n` +
    `Date:${new Date(item.created * 1000).toString()}`,
});

export const getStripePaymentIntentIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
  } = context;
  const paymentIntents: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let lastItemId: string | null = null;

  try {
    do {
      if (Date.now() - startTime > STRIPE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Stripe payment intents`);
        break;
      }

      const { data: fetchedItems, hasMore } = await fetchStripePaymentIntents({
        token,
        lastItemId,
      });
      paymentIntents.push(...fetchedItems.map(mapStripePaymentIntent));
      lastItemId = hasMore ? fetchedItems[fetchedItems.length - 1].id : null;
      if (lastItemId) {
        await delay(STRIPE_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (lastItemId);
  } catch (error) {
    Debugger.log('Error fetching Stripe payment intents:', error);

    return paymentIntents;
  }

  return paymentIntents;
};
