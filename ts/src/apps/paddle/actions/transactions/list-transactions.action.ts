import { TransactionOrigin, TransactionStatus } from '@paddle/paddle-node-sdk';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { paddleTransactionResponseType } from './response-types/transaction.response-type';
import { getPaddleCustomerIdAllowedValues } from '../../helpers/get-customer-id-allowed-values';
import { PaddleTransactionOriginAllowedValues } from '../../helpers/get-transaction-origin-allowed-values';
import { PaddleTransactionOrderByFieldsAllowedValues } from '../../helpers/get-transaction-order-by-fields-allowed-values';
import { PaddleTransactionStatusAllowedValues } from '../../helpers/get-transaction-status-allowed-values';
import { getPaddleSubscriptionIdAllowedValues } from '../../helpers/get-subscription-id-allowed-values';
import { PADDLE_APP_NAME, PaddleError } from '../../constants';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { createPaddleClient } from '../../helpers/constants';

const dateOperatorAllowedValues = [
  {
    value: 'EQ',
    display_name: 'Equal to',
  },
  {
    value: 'LT',
    display_name: 'Less than',
  },
  {
    value: 'LTE',
    display_name: 'Less than or equal to',
  },
  {
    value: 'GT',
    display_name: 'Greater than',
  },
  {
    value: 'GTE',
    display_name: 'Greater than or equal to',
  },
];

const options = {
  after: {
    type: 'string',
    required: false,
  },
  billed_at: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        operator: {
          type: 'string',
          required: true,
          allowed_values: dateOperatorAllowedValues,
        },
        value: {
          type: 'date',
          required: true,
        },
      },
    },
  },
  created_at: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        operator: {
          type: 'string',
          required: true,
          allowed_values: dateOperatorAllowedValues,
        },
        value: {
          type: 'date',
          required: true,
        },
      },
    },
  },
  updated_at: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        operator: {
          type: 'string',
          required: true,
          allowed_values: dateOperatorAllowedValues,
        },
        value: {
          type: 'date',
          required: true,
        },
      },
    },
  },
  customer_id: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getPaddleCustomerIdAllowedValues,
  },
  invoice_number: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
  },
  origin: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: PaddleTransactionOriginAllowedValues,
  },
  order: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          allowed_values: PaddleTransactionOrderByFieldsAllowedValues,
        },
        direction: {
          type: 'string',
          allowed_values: [
            { value: 'ASC', display_name: 'Ascending' },
            { value: 'DESC', display_name: 'Descending' },
          ],
        },
      },
    },
  },
  status: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: PaddleTransactionStatusAllowedValues,
  },
  subscription_id: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getPaddleSubscriptionIdAllowedValues,
  },
  per_page: {
    type: 'integer',
    default_value: 50,
    required: false,
  },
} satisfies TQoreOptions;

const listTransactions = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'list_transactions',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const after = obj?.after;
    const billedAt = obj?.billed_at;
    const createdAt = obj?.created_at;
    const updatedAt = obj?.updated_at;
    const customerId = obj?.customer_id;
    const invoiceNumber = obj?.invoice_number;
    const origin = obj?.origin as TransactionOrigin[] | undefined;
    const status = obj?.status as TransactionStatus[] | undefined;
    const subscriptionId = obj?.subscription_id;
    const perPage = obj?.per_page ? Math.min(obj.per_page, 200) : 50;
    const sortOrder = obj?.order?.direction || 'ASC';
    const sortField = obj?.order?.field || 'created_at';

    try {
      const client = createPaddleClient(token, instance_type);

      const transactionCollection = await client.transactions.list({
        perPage,
        orderBy: `${sortField}[${sortOrder}]`,
        ...(after && { after }),
        ...(customerId && { customerId }),
        ...(invoiceNumber && { invoiceNumber }),
        ...(origin && { origin }),
        ...(status && { status }),
        ...(subscriptionId && { subscriptionId }),
        ...(billedAt && billedAt.operator === 'EQ'
          ? { billed_at: billedAt.value }
          : { [`billed_at[${billedAt?.operator}]`]: billedAt?.value }),
        ...(createdAt && createdAt.operator === 'EQ'
          ? { created_at: createdAt.value }
          : { [`created_at[${createdAt?.operator}]`]: createdAt?.value }),
        ...(updatedAt && updatedAt.operator === 'EQ'
          ? { updated_at: updatedAt.value }
          : { [`updated_at[${updatedAt?.operator}]`]: updatedAt?.value }),
      });

      return await transactionCollection.next();
    } catch (error) {
      throw new PaddleError(`Failed to list transactions: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: paddleTransactionResponseType,
  },
});

export default listTransactions;
