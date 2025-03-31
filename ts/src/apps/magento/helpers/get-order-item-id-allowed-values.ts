import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

type TMagentoOrderItemData = {
  item_id: string;
  order_id: string;
  sku: string;
  name: string;
  price: number;
  qty_ordered: number;
  product_type: string;
};

export const getMagentoOrderItemIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const url = context?.conn_opts?.url;
  const orderId = context?.opts?.order_id || context?.opts?.entity.orderId;

  const missingValues: string[] = [];

  if (!url) missingValues.push('url');
  if (!token) missingValues.push('token');
  if (!orderId) missingValues.push('entity.orderId');

  if (missingValues.length) {
    throw new Error(
      `All of the following values are required: ${missingValues.join(', ')} to fetch order item IDs from Magento`
    );
  }

  try {
    const response = await QorusRequest.get<{ data: { items: TMagentoOrderItemData[] } }>(
      {
        path: `/V1/orders/${orderId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      {
        url: url!,
        endpointId: 'getMagentoOrderItemIdAllowedValues',
      }
    );

    const orderData = response?.data;

    if (!orderData?.items || !Array.isArray(orderData?.items)) {
      throw new Error('Invalid response from Magento API');
    }

    return orderData.items.map((item: TMagentoOrderItemData) => ({
      display_name: `${item.name} (${item.sku})`,
      value: item.item_id,
      desc:
        `Item ID: ${item.item_id}\n\n` +
        `SKU: ${item.sku}\n\n` +
        `Product Type: ${item.product_type}\n\n` +
        `Price: $${item.price}\n\n` +
        `Quantity Ordered: ${item.qty_ordered}`,
    }));
  } catch (error) {
    throw new Error(
      `Failed to fetch order item IDs: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
