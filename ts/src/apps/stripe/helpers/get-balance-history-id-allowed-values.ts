import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { delay } from '../../../global/helpers';
import { STRIPE_ALLOWED_VALUES_FETCH_DELAY, STRIPE_ALLOWED_VALUES_TIMEOUT } from './constants';

type TStripeBalanceHistoryData = {
  data: TStripeBalanceHistoryItem[];
  hasMore: boolean;
};

type TStripeBalanceHistoryItem = {
  id: string;
  object: string;
  amount: number;
  created: number;
  currency: string;
  description: string;
};

const fetchStripeBalanceHistory = async ({
  token,
  lastItemId,
}: {
  token: string;
  lastItemId?: string;
}): Promise<TStripeBalanceHistoryData> => {
  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/v1/balance/history` + (lastItemId ? `?starting_after=${lastItemId}` : ''),
    },
    { url: `https://api.stripe.com`, endpointId: 'Stripe' }
  );

  const { data: fetchedItems, hasMore } = data as TStripeBalanceHistoryData;

  return { data: fetchedItems, hasMore };
};

const mapStripeBalanceHistory = (item: TStripeBalanceHistoryItem): IQoreAllowedValue => ({
  value: item.id,
  display_name: `${item.object} - ${item.amount}`,
  desc:
    `id: ${item.id}\n\nObject:${item.object}\n\nAmount:${item.amount}\n\n` +
    `Currency:${item.currency}\n\nDescription:${item.description}\n\n` +
    `Date:${new Date(item.created * 1000).toString()}`,
});

export const getStripeBalanceHistoryIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
  } = context;

  const balanceHistoryIds: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let lastItemId = null;

  try {
    do {
      if (Date.now() - startTime > STRIPE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Stripe balance history`);
        break;
      }

      const { data: fetchedItems, hasMore } = await fetchStripeBalanceHistory({
        token,
        lastItemId,
      });

      balanceHistoryIds.push(...fetchedItems.map(mapStripeBalanceHistory));

      lastItemId = hasMore ? fetchedItems[fetchedItems.length - 1].id : null;

      if (lastItemId) {
        await delay(STRIPE_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (lastItemId);
  } catch (error) {
    Debugger.log('Error fetching Stripe balance history:', error);

    return balanceHistoryIds;
  }

  return balanceHistoryIds;
};
