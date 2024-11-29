import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

type TStripeChargeData = {
  data: {
    id: string;
    object: string;
    amount: number;
    created: number;
  }[];
  hasMore: boolean;
};

export const getStripeChargeIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
  } = context;

  const charges: IQoreAllowedValue[] = [];
  let lastItemId = null;

  do {
    const { data } = await QorusRequest.get<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: `/v1/charges` + (lastItemId ? `?starting_after=${lastItemId}` : ''),
      },
      { url: `https://api.stripe.com`, endpointId: 'Stripe' }
    );

    const { data: fetchedItems, hasMore } = data as TStripeChargeData;

    charges.push(
      ...fetchedItems.map(
        (item): IQoreAllowedValue => ({
          value: item.id,
          display_name: `${item.object} - ${item.amount} - ${new Date(item.created * 1000).toDateString()}`,
        })
      )
    );

    lastItemId = hasMore ? fetchedItems[fetchedItems.length - 1].id : null;
  } while (lastItemId);

  return charges;
};
