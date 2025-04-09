import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_CONN_OPTIONS, TShopifyContextWithConn } from '../constants';
import { executeShopifyGraphQL, extractShopifyNumericId, ShopifyError } from './constants';

export const getShopifyFulfillmentOrderLineItemIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SHOPIFY_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  let fulfillmentOrderId = context?.opts?.fulfillmentOrderId;

  if (!fulfillmentOrderId) {
    return [];
  }

  if (!fulfillmentOrderId.includes('gid://shopify')) {
    fulfillmentOrderId = `gid://shopify/FulfillmentOrder/${fulfillmentOrderId}`;
  }

  try {
    const query = `
      query {
        fulfillmentOrder(id: "${fulfillmentOrderId}") {
          lineItems(first: 100) {
            edges {
              node {
                id
                remainingQuantity
                totalQuantity
                lineItem {
                  name
                  title
                  variant {
                    title
                    sku
                  }
                  product {
                    title
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await executeShopifyGraphQL(context as TShopifyContextWithConn, query);

    if (!response.data?.fulfillmentOrder?.lineItems?.edges) {
      return [];
    }

    return response.data.fulfillmentOrder.lineItems.edges.map((edge: any) => {
      const node = edge.node;
      const lineItem = node.lineItem || {};
      const variant = lineItem.variant || {};
      const product = lineItem.product || {};

      return {
        display_name:
          `${lineItem.title || product.title || 'Unknown Product'}` +
          `(${node.remainingQuantity}/${node.totalQuantity})`,
        value: extractShopifyNumericId(node.id),
        desc:
          `Product: ${product.title || 'Unknown'}\n\n` +
          `Variant: ${variant.title || 'Default'}\n\n` +
          `SKU: ${variant.sku || 'No SKU'}\n\n` +
          `Quantity: ${node.remainingQuantity} available of ${node.totalQuantity} total`,
      };
    });
  } catch (error) {
    if (error instanceof ShopifyError) {
      throw error;
    }
    throw new ShopifyError(
      `Failed to fetch Shopify fulfillment order line items: ${error.message}`,
      error
    );
  }
};
