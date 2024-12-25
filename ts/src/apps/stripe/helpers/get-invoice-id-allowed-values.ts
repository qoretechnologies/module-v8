import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { delay } from '../../../global/helpers';
import { STRIPE_ALLOWED_VALUES_FETCH_DELAY, STRIPE_ALLOWED_VALUES_TIMEOUT } from './constants';

type TStripeInvoiceItem = {
  id: string;
  object: string;
  account_country: string;
  account_name: string;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  amount_shipping: number;
  created: number;
};

type TStripeInvoiceData = {
  data: TStripeInvoiceItem[];
  hasMore: boolean;
};

const fetchStripeInvoices = async ({
  token,
  lastItemId,
}: {
  token: string;
  lastItemId?: string | null;
}): Promise<TStripeInvoiceData> => {
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

const mapStripeInvoice = (item: TStripeInvoiceItem): IQoreAllowedValue => ({
  value: item.id,
  display_name: `${item.object} - ${item.id}`,
  desc:
    `id: ${item.id}\n\nAccount name: ${item.account_name}\n\nAccount country: ${item.account_country}\n\n` +
    `Object:${item.object}\n\nAmount due:${item.amount_due}\n\nAmount paid:${item.amount_paid}\n\n` +
    `Amount remaining:${item.amount_remaining}\n\nDate:${new Date(item.created * 1000).toString()}`,
});

export const getStripeInvoiceIdAllowedValues: TQoreGetAllowedValuesFunction = async (context) => {
  const {
    conn_opts: { token },
  } = context;

  const invoices: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let lastItemId: string | null = null;

  try {
    do {
      if (Date.now() - startTime > STRIPE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Stripe invoices`);
        break;
      }

      const { data: fetchedItems, hasMore } = await fetchStripeInvoices({ token, lastItemId });

      invoices.push(...fetchedItems.map(mapStripeInvoice));

      lastItemId = hasMore ? fetchedItems[fetchedItems.length - 1].id : null;

      if (lastItemId) {
        await delay(STRIPE_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (lastItemId);
  } catch (error) {
    Debugger.log('Error fetching Stripe invoices:', error);

    return invoices;
  }

  return invoices;
};
