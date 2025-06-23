import {
  CollectionMode,
  CurrencyCode,
  IBillingDetailsCreate,
  ITransactionsTimePeriod,
  TransactionStatus,
} from '@paddle/paddle-node-sdk';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../../constants';
import { createPaddleClient } from '../../helpers/constants';
import { PaddleCurrencyAllowedValues } from '../../helpers/get-currency-allowed-values';
import { getPaddleCustomerAddressIdAllowedValues } from '../../helpers/get-customer-address-id-allowed-values';
import { getPaddleCustomerBusinessIdAllowedValues } from '../../helpers/get-customer-business-allowed-values';
import { getPaddleCustomerIdAllowedValues } from '../../helpers/get-customer-id-allowed-values';
import { getPaddleDiscountIdAllowedValues } from '../../helpers/get-discount-id-allowed-values';
import { getPaddlePriceIdAllowedValues } from '../../helpers/get-price-id-allowed-values';
import { PaddleTransactionIncludeAllowedValues } from '../../helpers/get-transaction-include-fields-allowed-values';
import {
  getPaddleTransactionResponseTypeField,
  paddleTransactionResponseType,
} from './response-types/transaction.response-type';

const options = {
  include: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: PaddleTransactionIncludeAllowedValues,
  },
  items: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          price_id: {
            type: 'string',
            required: true,
            get_allowed_values: getPaddlePriceIdAllowedValues,
          },
          quantity: {
            type: 'number',
            required: true,
          },
        },
      },
    },
  },
  status: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'billed', display_name: 'Billed' },
      { value: 'canceled', display_name: 'Canceled' },
    ],
  },
  customer_id: {
    type: 'string',
    required: false,
    get_allowed_values: getPaddleCustomerIdAllowedValues,
    on_change: ['refetch'],
  },
  address_id: {
    type: 'string',
    required: false,
    depends_on: ['customer_id'],
    get_allowed_values: getPaddleCustomerAddressIdAllowedValues,
  },
  business_id: {
    type: 'string',
    required: false,
    depends_on: ['customer_id'],
    get_allowed_values: getPaddleCustomerBusinessIdAllowedValues,
  },
  custom_data: {
    type: 'hash',
    required: false,
  },
  currency_code: {
    type: 'string',
    required: false,
    allowed_values: PaddleCurrencyAllowedValues,
  },
  collection_mode: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'automatic', display_name: 'Automatic' },
      { value: 'manual', display_name: 'Manual' },
    ],
  },
  discount_id: {
    type: 'string',
    required: false,
    get_allowed_values: getPaddleDiscountIdAllowedValues,
  },
  billing_details: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        payment_terms: {
          required: true,
          type: {
            type: 'hash',
            fields: {
              interval: {
                type: 'string',
                required: true,
                allowed_values: [
                  { value: 'day', display_name: 'Day' },
                  { value: 'week', display_name: 'Week' },
                  { value: 'month', display_name: 'Month' },
                  { value: 'year', display_name: 'Year' },
                ],
              },
              frequency: {
                type: 'number',
                required: true,
              },
            },
          },
        },
        enable_checkout: {
          type: 'boolean',
          required: false,
        },
        purchase_order_number: {
          type: 'string',
          required: false,
        },
        additional_information: {
          type: 'string',
          required: false,
        },
      },
    },
  },
  billing_period: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        ends_at: {
          type: 'date',
          required: true,
        },
        starts_at: {
          type: 'date',
          required: true,
        },
      },
    },
  },
  checkout_url: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const createTransaction = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'create_transaction',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type, items } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['items'],
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const include = obj?.include as Array<any>;
    const status = obj?.status as TransactionStatus | undefined;
    const customerId = obj?.customer_id;
    const addressId = obj?.address_id;
    const businessId = obj?.business_id;
    const customData = obj?.custom_data;
    const currencyCode = obj?.currency_code as CurrencyCode | undefined;
    const collectionMode = obj?.collection_mode as CollectionMode | undefined;
    const discountId = obj?.discount_id;
    const billingDetails = obj?.billing_details as IBillingDetailsCreate | undefined;
    const billingPeriod = obj?.billing_period as ITransactionsTimePeriod | undefined;
    const checkoutUrl = obj?.checkout_url;

    try {
      const client = createPaddleClient(token, instance_type);

      const transaction = await client.transactions.create({
        items,
        ...(include && { include }),
        ...(status && { status }),
        ...(customerId && { customerId }),
        ...(addressId && { addressId }),
        ...(businessId && { businessId }),
        ...(customData && { customData }),
        ...(currencyCode && { currencyCode }),
        ...(collectionMode && { collectionMode }),
        ...(discountId && { discountId }),
        ...(billingDetails && { billingDetails }),
        ...(billingPeriod && { billingPeriod }),
        ...(checkoutUrl && { checkout: { url: checkoutUrl } }),
      });

      return transaction;
    } catch (error) {
      throw new PaddleError(`Failed to create a transaction: ${error.message || error}`);
    }
  },
  response_type: paddleTransactionResponseType,
  get_dynamic_response_type: (context) => {
    const include = context?.opts?.include || [];

    let responseTypeFields = paddleTransactionResponseType.fields;

    for (const field of include) {
      responseTypeFields = {
        ...responseTypeFields,
        ...getPaddleTransactionResponseTypeField(field),
      };
    }

    return {
      type: 'hash',
      fields: responseTypeFields,
    };
  },
});

export default createTransaction;
