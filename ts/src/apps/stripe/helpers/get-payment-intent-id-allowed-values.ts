import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

type TStripePaymentIntentData = {
  data: {
    id: string;
    object: string;
    amount: number;
    created: number;
  }[];
  hasMore: boolean;
};

export const getStripePaymentIntentIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
  } = context;

  const paymentIntents: IQoreAllowedValue[] = [];
  let lastItemId = null;

  do {
    const { data } = await QorusRequest.get<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: `/v1/payment_intents` + (lastItemId ? `?starting_after=${lastItemId}` : ''),
      },
      { url: `https://api.stripe.com`, endpointId: 'Stripe' }
    );

    const { data: fetchedItems, hasMore } = data as TStripePaymentIntentData;

    paymentIntents.push(
      ...fetchedItems.map(
        (item): IQoreAllowedValue => ({
          value: item.id,
          display_name: `${item.object} - ${item.amount}`,
          desc:
            `id: ${item.id}\nObject:${item.object}\nAmount:${item.amount}\n` +
            `Date:${new Date(item.created * 1000).toString()}`,
        })
      )
    );

    lastItemId = hasMore ? fetchedItems[fetchedItems.length - 1].id : null;
  } while (lastItemId);

  return paymentIntents;
};
