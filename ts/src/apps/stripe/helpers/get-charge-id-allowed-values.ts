import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { delay } from '../../../global/helpers';
import { STRIPE_ALLOWED_VALUES_FETCH_DELAY, STRIPE_ALLOWED_VALUES_TIMEOUT } from './constants';

type TStripeChargeItem = {
  id: string;
  object: string;
  amount: number;
  created: number;
};

type TStripeChargeData = {
  data: TStripeChargeItem[];
  hasMore: boolean;
};

const fetchStripeCharges = async ({
  token,
  lastItemId,
}: {
  token: string;
  lastItemId?: string | null;
}): Promise<TStripeChargeData> => {
  const path = `/v1/charges${lastItemId ? `?starting_after=${lastItemId}` : ''}`;

  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path,
    },
    { url: 'https://api.stripe.com', endpointId: 'Stripe' }
  );

  const { data: fetchedItems, hasMore } = data as TStripeChargeData;

  return { data: fetchedItems, hasMore };
};

const mapStripeCharge = (item: TStripeChargeItem): IQoreAllowedValue => ({
  value: item.id,
  display_name: `${item.object} - ${item.amount} - ${new Date(item.created * 1000).toDateString()}`,
  desc:
    `id: ${item.id}\n\nObject: ${item.object}\n\nAmount: ${item.amount}\n\n` +
    `Date: ${new Date(item.created * 1000).toString()}`,
});

export const getStripeChargeIdAllowedValues: TQoreGetAllowedValuesFunction = async (context) => {
  const {
    conn_opts: { token },
  } = context;

  const charges: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let lastItemId: string | null = null;

  try {
    do {
      if (Date.now() - startTime > STRIPE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Stripe charges`);
        break;
      }

      const { data: fetchedItems, hasMore } = await fetchStripeCharges({
        token,
        lastItemId,
      });

      charges.push(...fetchedItems.map(mapStripeCharge));

      lastItemId = hasMore ? fetchedItems[fetchedItems.length - 1].id : null;

      if (lastItemId) {
        await delay(STRIPE_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (lastItemId);
  } catch (error) {
    Debugger.log('Error fetching Stripe charges:', error);

    return charges;
  }

  return charges;
};
