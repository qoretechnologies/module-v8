import { TransactionOrigin, TransactionStatus } from '@paddle/paddle-node-sdk';
import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { paddleTransactionResponseType } from '../actions/transactions/response-types/transaction.response-type';
import { PADDLE_APP_NAME, PADDLE_INSTANCE_TYPE, PaddleError } from '../constants';
import { createPaddleClient } from '../helpers/constants';
import { getPaddleCustomerIdAllowedValues } from '../helpers/get-customer-id-allowed-values';
import { getPaddleSubscriptionIdAllowedValues } from '../helpers/get-subscription-id-allowed-values';
import { PaddleTransactionOriginAllowedValues } from '../helpers/get-transaction-origin-allowed-values';
import { PaddleTransactionStatusAllowedValues } from '../helpers/get-transaction-status-allowed-values';

const PaddleNewTransactionTrigger = QoreAppCreator.createLocalizedTrigger({
  app: PADDLE_APP_NAME,
  action: 'new_transaction',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    customer_id: {
      required: false,
      type: {
        type: 'list',
        element_type: 'string',
      },
      get_element_allowed_values: getPaddleCustomerIdAllowedValues,
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
    origin: {
      required: false,
      type: {
        type: 'list',
        element_type: 'string',
      },
      element_allowed_values: PaddleTransactionOriginAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, instance_type } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const { customer_id, subscription_id, status, origin } = context.opts || {};

    const getItems = () => {
      return fetchLatestTransactions({
        token,
        instance_type,
        customer_id,
        subscription_id,
        status: status as TransactionStatus[] | undefined,
        origin: origin as TransactionOrigin[] | undefined,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'paddle_new_transaction',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, instance_type } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const { customer_id, subscription_id, status, origin } = context.opts || {};

    const transactions = await fetchLatestTransactions({
      token,
      instance_type,
      customer_id,
      subscription_id,
      status: status as TransactionStatus[] | undefined,
      origin: origin as TransactionOrigin[] | undefined,
    });

    return transactions?.length > 0 ? transactions[0] : null;
  },
  event_info: {
    desc: 'Paddle New Transaction Trigger Event Info',
    type: paddleTransactionResponseType,
  },
});

export default PaddleNewTransactionTrigger;

const fetchLatestTransactions = async (options: {
  token: string;
  instance_type: (typeof PADDLE_INSTANCE_TYPE)[keyof typeof PADDLE_INSTANCE_TYPE];
  customer_id?: string[];
  subscription_id?: string[];
  status?: TransactionStatus[];
  origin?: TransactionOrigin[];
}) => {
  const { token, instance_type, customer_id, subscription_id, status, origin } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const client = createPaddleClient(token, instance_type);

    const transactionCollection = client.transactions.list({
      perPage: limit,
      orderBy: 'created_at[DESC]',
      ...(customer_id && { customerId: customer_id }),
      ...(subscription_id && { subscriptionId: subscription_id }),
      ...(status && { status }),
      ...(origin && { origin }),
    });

    const result = await transactionCollection.next();

    return result || [];
  } catch (error) {
    throw new PaddleError(`Failed to fetch latest transactions: ${error.message || error}`);
  }
};
