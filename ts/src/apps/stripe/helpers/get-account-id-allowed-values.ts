import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { STRIPE_ALLOWED_VALUES_FETCH_DELAY, STRIPE_ALLOWED_VALUES_TIMEOUT } from './constants';

type TStripeAccountData = {
  data: TStripeAccount[];
  hasMore: boolean;
};

type TStripeAccount = {
  id: string;
  business_profile: {
    name: string;
    product_description: string;
    url: string;
    support_url: string;
  };
};

const fetchStripeAccounts = async ({
  token,
  lastItemId,
}: {
  token: string;
  lastItemId?: string;
}): Promise<TStripeAccountData> => {
  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/v1/accounts` + (lastItemId ? `?starting_after=${lastItemId}` : ''),
    },
    { url: `https://api.stripe.com`, endpointId: 'Stripe' }
  );

  const { data: fetchedItems, hasMore } = data as TStripeAccountData;

  return { data: fetchedItems, hasMore };
};

const mapStripeAccount = (item: TStripeAccount): IQoreAllowedValue => ({
  value: item.id,
  display_name: item.business_profile?.name,
  desc:
    `id: ${item.id}\n\nProduct: ${item.business_profile?.product_description}\n\n` +
    `URL: ${item.business_profile?.url}\n\nSupport URL: ${item.business_profile?.support_url}`,
});

export const getStripeAccountIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Stripe account allowed values');
  }

  const accounts: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let lastItemId = undefined;

  try {
    do {
      if (Date.now() - startTime > STRIPE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Stripe accounts`);
        break;
      }

      const { data: fetchedItems, hasMore } = await fetchStripeAccounts({ token, lastItemId });

      accounts.push(...fetchedItems.map(mapStripeAccount));

      lastItemId = hasMore ? fetchedItems[fetchedItems.length - 1].id : null;
      if (lastItemId) {
        await delay(STRIPE_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (lastItemId);
  } catch (error) {
    Debugger.log('Error fetching Stripe accounts:', error);

    return accounts;
  }

  return accounts;
};
