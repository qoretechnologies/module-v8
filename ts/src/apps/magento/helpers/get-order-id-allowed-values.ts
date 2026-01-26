import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchMagentoAllowedValues } from '../../magento/helpers/constants';

type TMagentoOrderData = {
  entity_id: string;
  increment_id: string;
  customer_email: string;
  customer_firstname: string;
  customer_lastname: string;
  base_currency_code: string;
  base_grand_total: number;
  status: string;
  grand_total: number;
  created_at: string;
  items: {
    name: string;
  }[];
};

const mapMagentoOrder = (order: TMagentoOrderData): IQoreAllowedValue<string> => ({
  display_name:
    `${order.customer_firstname} ${order.customer_lastname} ` +
    `- ${order.base_grand_total} ${order.base_currency_code}`,
  value: order.entity_id.toString(),
  desc:
    `Status: ${order.status}\n\n` +
    `Customer: ${order.customer_email}\n\n` +
    `Total: $${order.grand_total}\n\n` +
    `Items:\n${order.items.map((item) => `  - ${item.name}`).join('\n')}`,
});

export const getMagentoOrderIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const url = context?.conn_opts?.url;

  const missingValues: string[] = [];

  if (!url) missingValues.push('url');
  if (!token) missingValues.push('token');

  if (missingValues.length) {
    throw new Error(
      `All of the following values are required: ${missingValues.join(', ')} to fetch order allowed values for Magento`
    );
  }

  const orders = await fetchMagentoAllowedValues<TMagentoOrderData>({
    url: url!,
    token: token!,
    mapItemToAllowedValue: mapMagentoOrder,
    path: '/V1/orders',
  });

  return orders;
};
