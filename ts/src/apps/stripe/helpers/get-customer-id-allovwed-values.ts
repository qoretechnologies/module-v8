import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { delay } from '../../../global/helpers';
import { STRIPE_ALLOWED_VALUES_FETCH_DELAY, STRIPE_ALLOWED_VALUES_TIMEOUT } from './constants';

type TStripeCustomerItem = {
  id: string;
  email: string;
  name: string;
  description: string;
  invoice_prefix: string;
  phone: string;
};

type TStripeCustomerData = {
  data: TStripeCustomerItem[];
  hasMore: boolean;
};

const fetchStripeCustomers = async ({
  token,
  lastItemId,
}: {
  token: string;
  lastItemId?: string | null;
}): Promise<TStripeCustomerData> => {
  const path = `/v1/customers${lastItemId ? `?starting_after=${lastItemId}` : ''}`;

  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path,
    },
    { url: 'https://api.stripe.com', endpointId: 'Stripe' }
  );

  const { data: fetchedCustomers, hasMore } = data as TStripeCustomerData;

  return { data: fetchedCustomers, hasMore };
};

const mapStripeCustomer = (item: TStripeCustomerItem): IQoreAllowedValue => ({
  value: item.id,
  display_name: item.email || item.name,
  desc:
    `id: ${item.id}\n\nDescription: ${item.description}\n\n` +
    `Invoice Prefix: ${item.invoice_prefix}\n\nPhone: ${item.phone}`,
});

export const getStripeCustomerIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
  } = context;

  const customers: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let lastItemId: string | null = null;

  try {
    do {
      if (Date.now() - startTime > STRIPE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Stripe customers`);
        break;
      }

      const { data: fetchedItems, hasMore } = await fetchStripeCustomers({
        token,
        lastItemId,
      });

      customers.push(...fetchedItems.map(mapStripeCustomer));

      lastItemId = hasMore ? fetchedItems[fetchedItems.length - 1].id : null;

      if (lastItemId) {
        await delay(STRIPE_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (lastItemId);
  } catch (error) {
    Debugger.log('Error fetching Stripe customers:', error);

    return customers;
  }

  return customers;
};
