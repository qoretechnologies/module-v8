import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import { ShopifyError, transformShopifyResponse } from '../helpers/constants';
import { getShopifyCurrencyAllowedValues } from '../helpers/get-currency-allowed-values';
import { getShopifyOrderIdAllowedValues } from '../helpers/get-order-id-allowed-values';
import { ShopifyCreateTransactionResponseType } from './response-types/create-transaction.response';
import { executeShopifyGraphQL } from '../helpers/constants';
import { getShopifyParentTransactionIdAllowedValues } from '../helpers/get-parent-transaction-id-allowed-values';

const options = {
  orderId: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    get_allowed_values: getShopifyOrderIdAllowedValues,
  },
  amount: {
    type: 'float',
    required: false,
    preselected: true,
  },
  currency: {
    type: 'string',
    required: false,
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getShopifyCurrencyAllowedValues,
  },
  type: {
    type: 'string',
    required: true,
    desc: 'The type of the transaction',
    allowed_values: [
      { display_name: 'Capture', value: 'CAPTURE' },
      { display_name: 'Sale', value: 'SALE' },
      { display_name: 'Void', value: 'VOID' },
      { display_name: 'Refund', value: 'REFUND' },
    ],
  },
  parentTransactionId: {
    type: 'string',
    required: false,
    depends_on: ['orderId', 'type'],
    allowed_values_creatable: true,
    get_allowed_values: getShopifyParentTransactionIdAllowedValues,
  },
  gateway: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    allowed_values: [
      { display_name: 'Bogus (Test Gateway)', value: 'bogus' },
      { display_name: 'Manual', value: 'manual' },
      { display_name: 'Cash', value: 'cash' },
      { display_name: 'Gift Card', value: 'gift_card' },
    ],
  },
  finalCapture: {
    type: 'bool',
    required: false,
  },
} satisfies TQoreOptions;

type TCreateTransactionInput = {
  orderId: string;
  amount: number;
  currency: string;
  type: string;
  parentTransactionId?: string;
  finalCapture?: boolean;
  gateway?: string;
};

const createTransaction = async (
  context: TShopifyContextWithConn,
  data: TCreateTransactionInput
) => {
  switch (data.type) {
    case 'CAPTURE': {
      const orderCaptureMutation = `
        mutation orderCapture($input: OrderCaptureInput!) {
          orderCapture(input: $input) {
            transaction {
              id
              createdAt
              processedAt
              gateway
              kind
              status
              amountSet {
                shopMoney {
                  amount
                  currencyCode
                }
                presentmentMoney {
                  amount
                  currencyCode
                }
              }
              order {
                id
              }
            }
            userErrors {
              message
              field
            }
          }
        }
      `;

      const captureInput = {
        id: `gid://shopify/Order/${data.orderId}`,
        parentTransactionId: `gid://shopify/OrderTransaction/${data.parentTransactionId}`,
        amount: data.amount.toString(),
        currency: data.currency,
        ...(data.finalCapture !== undefined && { finalCapture: data.finalCapture }),
      };

      const result = await executeShopifyGraphQL(context, orderCaptureMutation, {
        input: captureInput,
      });

      const userErrors = result.data?.orderCapture?.userErrors || [];
      if (userErrors.length > 0) {
        const errors = userErrors.map((err: { message: string }) => err.message).join('; ');
        throw new ShopifyError(`Failed to capture transaction: ${errors}`);
      }

      return result.data.orderCapture;
    }

    case 'VOID': {
      const voidMutation = `
        mutation transactionVoid($id: ID!, $parentTransactionId: ID!) {
          transactionVoid(id: $id, parentTransactionId: $parentTransactionId) {
            transaction {
              id
              createdAt
              processedAt
              gateway
              kind
              status
              amountSet {
                shopMoney {
                  amount
                  currencyCode
                }
                presentmentMoney {
                  amount
                  currencyCode
                }
              }
              order {
                id
              }
            }
            userErrors {
              message
              field
            }
          }
        }
      `;

      const variables = {
        id: `gid://shopify/Order/${data.orderId}`,
        parentTransactionId: `gid://shopify/OrderTransaction/${data.parentTransactionId}`,
      };

      const result = await executeShopifyGraphQL(context, voidMutation, variables);

      const userErrors = result.data?.transactionVoid?.userErrors || [];
      if (userErrors.length > 0) {
        const errors = userErrors.map((err: { message: string }) => err.message).join('; ');
        throw new ShopifyError(`Failed to void transaction: ${errors}`);
      }

      return result.data.transactionVoid;
    }

    case 'REFUND': {
      const refundMutation = `
        mutation refundCreate($input: RefundInput!) {
          refundCreate(input: $input) {
            refund {
              id
              transactions {
                id
                createdAt
                processedAt
                gateway
                kind
                status
                amountSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                }
                order {
                  id
                }
              }
            }
            userErrors {
              message
              field
            }
          }
        }
      `;

      const refundInput = {
        orderId: `gid://shopify/Order/${data.orderId}`,
        transactions: [
          {
            parentId: `gid://shopify/OrderTransaction/${data.parentTransactionId}`,
            amount: data.amount.toString(),
            kind: 'REFUND',
            gateway: data.gateway || undefined,
          },
        ],
        currency: data.currency,
      };

      const result = await executeShopifyGraphQL(context, refundMutation, { input: refundInput });

      const userErrors = result.data?.refundCreate?.userErrors || [];
      if (userErrors.length > 0) {
        const errors = userErrors.map((err: { message: string }) => err.message).join('; ');
        throw new ShopifyError(`Failed to refund transaction: ${errors}`);
      }

      return {
        transaction: result.data.refundCreate.refund.transactions[0],
      };
    }

    case 'SALE': {
      const markAsPaidMutation = `
        mutation orderMarkAsPaid($input: OrderMarkAsPaidInput!) {
          orderMarkAsPaid(input: $input) {
            order {
              id
              displayFinancialStatus
            }
            userErrors {
              message
              field
            }
          }
        }
      `;

      const markAsPaidInput = {
        id: `gid://shopify/Order/${data.orderId}`,
      };

      const result = await executeShopifyGraphQL(context, markAsPaidMutation, {
        input: markAsPaidInput,
      });

      const userErrors = result.data?.orderMarkAsPaid?.userErrors || [];
      if (userErrors.length > 0) {
        const errors = userErrors.map((err: { message: string }) => err.message).join('; ');
        throw new ShopifyError(`Failed to mark order as paid: ${errors}`);
      }

      return {
        transaction: result.data.orderMarkAsPaid.transaction,
      };
    }

    default:
      throw new ShopifyError(`Unsupported transaction type: ${data.type}`);
  }
};

export const CreateShopifyTransaction = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'create-transaction',
  app: SHOPIFY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    try {
      if (
        data?.type &&
        ['CAPTURE', 'VOID', 'REFUND'].includes(data.type) &&
        !data.parentTransactionId
      ) {
        throw new ShopifyError(
          `Parent transaction ID is required for ${data.type.toLowerCase()} transactions`
        );
      }

      if (data?.amount <= 0) {
        throw new ShopifyError('Transaction amount must be greater than 0');
      }

      const result = await createTransaction(
        context as TShopifyContextWithConn,
        data as TCreateTransactionInput
      );

      return transformShopifyResponse(result);
    } catch (error) {
      if (error instanceof ShopifyError) {
        throw error;
      }
      throw new ShopifyError(`Failed to create Shopify transaction: ${error.message}`, error);
    }
  },
  options,
  response_type: ShopifyCreateTransactionResponseType,
});
