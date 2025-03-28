import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchMagentoAllowedValues } from '../../magento/helpers/constants';

type TMagentoInvoiceData = {
  entity_id: string;
  increment_id: string;
  order_id: string;
  order_increment_id: string;
  created_at: string;
  grand_total: number;
  state: string;
  items: {
    name: string;
    qty: number;
  }[];
};

const mapMagentoInvoice = (invoice: TMagentoInvoiceData): IQoreAllowedValue<string> => ({
  display_name: `Invoice #${invoice.increment_id} - Order #${invoice.order_increment_id}`,
  value: invoice.entity_id,
  desc:
    `Created: ${invoice.created_at}\n\n` +
    `State: ${invoice.state}\n\n` +
    `Total: $${invoice.grand_total}\n\n` +
    `Items:\n${invoice.items.map((item) => `  - ${item.name} (${item.qty})`).join('\n')}`,
});

export const getMagentoInvoiceIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const url = context?.conn_opts?.url;

  const missingValues: string[] = [];

  if (!url) missingValues.push('url');
  if (!token) missingValues.push('token');

  if (missingValues.length) {
    throw new Error(
      `All of the following values are required: ${missingValues.join(', ')}` +
        ` to fetch invoice allowed values for Magento`
    );
  }

  const invoices = await fetchMagentoAllowedValues<TMagentoInvoiceData>({
    url: url!,
    token: token!,
    mapItemToAllowedValue: mapMagentoInvoice,
    path: '/V1/invoices',
  });

  return invoices;
};
