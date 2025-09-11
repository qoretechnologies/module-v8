import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import {
  executeShopifyGraphQL,
  ShopifyError,
  transformShopifyResponse,
} from '../helpers/constants';
import { getShopifyCurrencyAllowedValues } from '../helpers/get-currency-allowed-values';
import { getShopifyLocationIdAllowedValues } from '../helpers/get-location-id-allowed-values';
import { getShopifyOrderIdAllowedValues } from '../helpers/get-order-id-allowed-values';
import { getShopifyProductVariantIdAllowedValues } from '../helpers/get-product-variant-id-allowed-values';
import { ShopifyAddLineItemToOrderResponseType } from './response-types/add-line-item-to-order.response';

const options = {
  orderId: {
    type: 'string',
    required: true,
    get_allowed_values: getShopifyOrderIdAllowedValues,
  },
  type: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    allowed_values: [
      {
        value: 'product',
        display_name: 'Product',
      },
      {
        value: 'custom_item',
        display_name: 'Custom Item',
      },
    ],
    get_dependent_options: (context) => {
      const type = context?.opts?.type;

      if (type === 'product') {
        return additional_product_options;
      } else if (type === 'custom_item') {
        return additional_custom_item_options;
      }

      return {};
    },
  },
  quantity: {
    type: 'int',
    required: true,
  },
  locationId: {
    type: 'string',
    get_allowed_values: getShopifyLocationIdAllowedValues,
    required: false,
  },
  reason: {
    type: 'string',
    required: false,
  },
  notifyCustomer: {
    type: 'bool',
    required: true,
    default_value: false,
    preselected: true,
  },
} satisfies TQoreOptions;

const additional_product_options = {
  variantId: {
    type: 'string',
    required: true,
    get_allowed_values: getShopifyProductVariantIdAllowedValues,
  },
  allowDuplicates: {
    type: 'bool',
    required: false,
  },
} satisfies TQoreOptions;

const additional_custom_item_options = {
  itemName: {
    type: 'string',
    required: true,
  },
  price: {
    type: 'number',
    required: true,
  },
  currency: {
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getShopifyCurrencyAllowedValues,
    required: true,
  },
  isTaxable: {
    type: 'bool',
    required: false,
  },
  isPhysical: {
    type: 'bool',
    required: false,
  },
} satisfies TQoreOptions;

const beginOrderEdit = async (context: TShopifyContextWithConn, orderId: string) => {
  const beginEditMutation = `
    mutation orderEditBegin($id: ID!) {
      orderEditBegin(id: $id) {
        calculatedOrder {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const beginEditVariables = {
    id: `gid://shopify/Order/${orderId}`,
  };

  const beginEditResult = await executeShopifyGraphQL(
    context,
    beginEditMutation,
    beginEditVariables
  );

  const beginEditErrors = beginEditResult.data?.orderEditBegin?.userErrors || [];
  if (beginEditErrors.length > 0) {
    const errors = beginEditErrors.map((err: { message: string }) => err.message).join('; ');
    throw new ShopifyError(`Failed to begin order edit: ${errors}`);
  }

  return beginEditResult.data.orderEditBegin;
};

const addProductVariant = async (
  context: TShopifyContextWithConn,
  calculatedOrderId: string,
  variantId: string,
  quantity: number,
  allowDuplicates?: boolean,
  locationId?: string
) => {
  const addVariantMutation = `
    mutation orderEditAddVariant(
      $id: ID!, 
      $variantId: ID!, 
      $quantity: Int!, 
      $allowDuplicates: Boolean, 
      $locationId: ID
    ) {
      orderEditAddVariant(
        id: $id,
        variantId: $variantId,
        quantity: $quantity,
        allowDuplicates: $allowDuplicates,
        locationId: $locationId
      ) {
        calculatedLineItem {
          id
          quantity
          title
          variantTitle
          discountedUnitPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          originalUnitPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
        }
        calculatedOrder {
          id
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const addVariantVariables: Record<string, any> = {
    id: calculatedOrderId,
    variantId: `gid://shopify/ProductVariant/${variantId}`,
    quantity: quantity || 1,
  };

  if (allowDuplicates !== undefined) {
    addVariantVariables.allowDuplicates = allowDuplicates;
  }

  if (locationId) {
    addVariantVariables.locationId = `gid://shopify/Location/${locationId}`;
  }

  const addVariantResult = await executeShopifyGraphQL(
    context,
    addVariantMutation,
    addVariantVariables
  );

  const addVariantErrors = addVariantResult.data?.orderEditAddVariant?.userErrors || [];
  if (addVariantErrors.length > 0) {
    const errors = addVariantErrors.map((err: { message: string }) => err.message).join('; ');
    throw new ShopifyError(`Failed to add product variant to order: ${errors}`);
  }

  return addVariantResult.data.orderEditAddVariant;
};

const addCustomItem = async (
  context: TShopifyContextWithConn,
  calculatedOrderId: string,
  title: string,
  quantity: number,
  price: number,
  currencyCode: string,
  isTaxable?: boolean,
  isPhysical?: boolean
) => {
  const addCustomItemMutation = `
    mutation orderEditAddCustomItem(
      $id: ID!, 
      $title: String!, 
      $quantity: Int!, 
      $price: MoneyInput!, 
      $taxable: Boolean, 
      $requiresShipping: Boolean
    ) {
      orderEditAddCustomItem(
        id: $id,
        title: $title,
        quantity: $quantity,
        price: $price,
        taxable: $taxable,
        requiresShipping: $requiresShipping
      ) {
        calculatedLineItem {
          id
          quantity
          title
          variantTitle
          discountedUnitPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          originalUnitPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
        }
        calculatedOrder {
          id
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const addCustomItemVariables: Record<string, any> = {
    id: calculatedOrderId,
    title,
    quantity: quantity || 1,
    price: {
      amount: price?.toString(),
      currencyCode,
    },
  };

  if (isTaxable !== undefined) {
    addCustomItemVariables.taxable = isTaxable;
  }

  if (isPhysical !== undefined) {
    addCustomItemVariables.requiresShipping = isPhysical;
  }

  const addCustomItemResult = await executeShopifyGraphQL(
    context,
    addCustomItemMutation,
    addCustomItemVariables
  );

  const addCustomItemErrors = addCustomItemResult.data?.orderEditAddCustomItem?.userErrors || [];
  if (addCustomItemErrors.length > 0) {
    const errors = addCustomItemErrors.map((err: { message: string }) => err.message).join('; ');
    throw new ShopifyError(`Failed to add custom item to order: ${errors}`);
  }

  return addCustomItemResult.data.orderEditAddCustomItem;
};

const commitOrderEdit = async (
  context: TShopifyContextWithConn,
  calculatedOrderId: string,
  notifyCustomer?: boolean,
  staffNote?: string
) => {
  const commitMutation = `
    mutation orderEditCommit($id: ID!, $notifyCustomer: Boolean, $staffNote: String) {
      orderEditCommit(
        id: $id,
        notifyCustomer: $notifyCustomer,
        staffNote: $staffNote
      ) {
        order {
          id
          name
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          updatedAt
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const commitVariables: Record<string, any> = {
    id: calculatedOrderId,
    notifyCustomer: notifyCustomer || false,
  };

  if (staffNote) {
    commitVariables.staffNote = staffNote;
  }

  const commitResult = await executeShopifyGraphQL(context, commitMutation, commitVariables);

  const commitErrors = commitResult.data?.orderEditCommit?.userErrors || [];
  if (commitErrors.length > 0) {
    const errors = commitErrors.map((err: { message: string }) => err.message).join('; ');
    throw new ShopifyError(`Failed to commit order changes: ${errors}`);
  }

  return commitResult.data.orderEditCommit;
};

const AddLineItemToShopifyOrder = QoreAppCreator.createLocalizedAction<
  typeof options &
    Partial<typeof additional_custom_item_options & typeof additional_product_options>
>({
  action: 'add-line-item-to-order',
  app: SHOPIFY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const {
      orderId,
      type,
      quantity,
      locationId,
      reason,
      notifyCustomer,
      variantId,
      allowDuplicates,
      itemName,
      price,
      currency,
      isTaxable,
      isPhysical,
    } = data || {};

    if (!orderId || !type || !quantity) {
      throw new ShopifyError('Order ID, type, and quantity are required');
    }

    if (type === 'product' && !variantId) {
      throw new ShopifyError('Variant ID is required for product type');
    }

    if (type === 'custom_item' && (!itemName || price === undefined || !currency)) {
      throw new ShopifyError('Item name, price, and currency are required for custom item type');
    }

    try {
      const beginEditResult = await beginOrderEdit(context as TShopifyContextWithConn, orderId);
      const calculatedOrderId = beginEditResult.calculatedOrder?.id;

      if (!calculatedOrderId) {
        throw new ShopifyError('Failed to get calculated order ID');
      }

      let addLineItemResult;
      if (type === 'product') {
        addLineItemResult = await addProductVariant(
          context as TShopifyContextWithConn,
          calculatedOrderId,
          variantId!,
          quantity,
          allowDuplicates,
          locationId
        );
      } else {
        addLineItemResult = await addCustomItem(
          context as TShopifyContextWithConn,
          calculatedOrderId,
          itemName!,
          quantity,
          price!,
          currency!,
          isTaxable,
          isPhysical
        );
      }

      const commitResult = await commitOrderEdit(
        context as TShopifyContextWithConn,
        calculatedOrderId,
        notifyCustomer,
        reason
      );

      return transformShopifyResponse({
        ...commitResult,
        addedItem: addLineItemResult.calculatedLineItem,
      });
    } catch (error) {
      if (error instanceof ShopifyError) {
        throw error;
      }
      throw new ShopifyError(`Failed to add line item to Shopify order: ${error.message}`, error);
    }
  },
  options,
  response_type: ShopifyAddLineItemToOrderResponseType,
});

export default AddLineItemToShopifyOrder;
