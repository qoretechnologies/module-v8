import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

type TStripeInvoiceData = {
  data: {
    id: string;
    object: string;
    account_country: string;
    account_name: string;
    amount_due: 0;
    amount_paid: 0;
    amount_remaining: 0;
    amount_shipping: 0;
    created: number;
  }[];
  hasMore: boolean;
};

export const getStripeInvoiceIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
  } = context;

  const invoices: IQoreAllowedValue[] = [];
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

    const { data: fetchedItems, hasMore } = data as TStripeInvoiceData;

    invoices.push(
      ...fetchedItems.map(
        (item): IQoreAllowedValue => ({
          value: item.id,
          display_name: `${item.object} - ${item.id}`,
          desc:
            `id: ${item.id}\nAccount name: ${item.account_name}\nAccount country: ${item.account_country}` +
            `Object:${item.object}\nAmount due:${item.amount_due}\n` +
            `Amount paid:${item.amount_paid}\nAmount remaining:${item.amount_remaining}\n` +
            `Date:${new Date(item.created * 1000).toString()}`,
        })
      )
    );

    lastItemId = hasMore ? fetchedItems[fetchedItems.length - 1].id : null;
  } while (lastItemId);

  return invoices;
};
