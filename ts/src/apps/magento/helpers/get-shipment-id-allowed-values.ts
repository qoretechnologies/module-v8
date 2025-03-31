import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchMagentoAllowedValues } from '../../magento/helpers/constants';

type TMagentoShipmentData = {
  entity_id: string;
  increment_id: string;
  order_id: string;
  order_increment_id: string;
  customer_id: string;
  created_at: string;
  total_qty: number;
  items: {
    name: string;
    qty: number;
    sku: string;
  }[];
  tracks: {
    title: string;
    track_number: string;
    carrier_code: string;
  }[];
};

const mapMagentoShipment = (shipment: TMagentoShipmentData): IQoreAllowedValue<string> => ({
  display_name: `Shipment #${shipment.increment_id} - Order #${shipment.order_increment_id}`,
  value: shipment.entity_id,
  desc:
    `Created: ${shipment.created_at}\n\n` +
    `Total Quantity: ${shipment.total_qty}\n\n` +
    `Items:\n${shipment.items.map((item) => `  - ${item.name} (${item.qty}) [${item.sku}]`).join('\n')}`,
});

export const getMagentoShipmentIdAllowedValues: TQoreGetAllowedValuesFunction<
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
        ` to fetch shipment allowed values for Magento`
    );
  }

  const shipments = await fetchMagentoAllowedValues<TMagentoShipmentData>({
    url: url!,
    token: token!,
    mapItemToAllowedValue: mapMagentoShipment,
    path: '/V1/shipments',
  });

  return shipments;
};
