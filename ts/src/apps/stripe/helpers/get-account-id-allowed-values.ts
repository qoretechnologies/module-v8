import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

type TStripeAccountData = {
  data: {
    id: string;
    business_profile: {
      name: string;
      product_description: string;
      url: string;
      support_url: string;
    };
  }[];
  hasMore: boolean;
};

export const getStripeAccountIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
  } = context;

  const accounts: IQoreAllowedValue[] = [];
  let lastItemId = null;

  do {
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

    accounts.push(
      ...fetchedItems.map(
        (item): IQoreAllowedValue => ({
          value: item.id,
          display_name: item.business_profile?.name,
          desc:
            `id: ${item.id}\n\nProduct: ${item.business_profile?.product_description}\n\n` +
            `URL: ${item.business_profile?.url}\n\nSupport URL: ${item.business_profile?.support_url}`,
        })
      )
    );

    lastItemId = hasMore ? fetchedItems[fetchedItems.length - 1].id : null;
  } while (lastItemId);

  return accounts;
};
