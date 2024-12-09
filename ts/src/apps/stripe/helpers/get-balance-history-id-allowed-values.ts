import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

type TStripeBalanceHistoryData = {
  data: {
    id: string;
    object: string;
    amount: number;
    created: number;
    currency: string;
    description: string;
  }[];
  hasMore: boolean;
};

export const getStripeBalanceHistoryIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
  } = context;

  const balanceHistoryIds: IQoreAllowedValue[] = [];
  let lastItemId = null;

  do {
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

    balanceHistoryIds.push(
      ...fetchedItems.map(
        (item): IQoreAllowedValue => ({
          value: item.id,
          display_name: `${item.object} - ${item.amount}`,
          desc:
            `id: ${item.id}\nObject:${item.object}\nAmount:${item.amount}\n` +
            `Currency:${item.currency}\nDescription:${item.description}` +
            `Date:${new Date(item.created * 1000).toString()}`,
        })
      )
    );

    lastItemId = hasMore ? fetchedItems[fetchedItems.length - 1].id : null;
  } while (lastItemId);

  return balanceHistoryIds;
};
