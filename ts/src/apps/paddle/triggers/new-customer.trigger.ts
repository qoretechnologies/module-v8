import { Status } from '@paddle/paddle-node-sdk';
import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { PADDLE_APP_NAME, PADDLE_INSTANCE_TYPE, PaddleError } from '../constants';
import { createPaddleClient } from '../helpers/constants';
import { PaddleStatusAllowedValues } from '../helpers/get-status-allowed-values';

const PaddleNewCustomerTrigger = QoreAppCreator.createLocalizedTrigger({
  app: PADDLE_APP_NAME,
  action: 'new_customer',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    status: {
      type: 'string',
      required: false,
      allowed_values: PaddleStatusAllowedValues,
    },
    search: {
      type: 'string',
      required: false,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, instance_type } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const { status, search } = context.opts || {};

    const getItems = () => {
      return fetchLatestCustomers({
        token,
        instance_type,
        status: status as Status | undefined,
        search,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'paddle_new_customer',
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

    const { status, search } = context.opts || {};

    const customers = await fetchLatestCustomers({
      token,
      instance_type,
      status: status as Status | undefined,
      search,
    });

    return customers?.length > 0 ? customers[0] : null;
  },
  event_info: {
    desc: 'Paddle New Customer Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        marketingConsent: { type: 'boolean' },
        status: { type: 'string' },
        customData: { type: 'hash' },
        locale: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  },
});

export default PaddleNewCustomerTrigger;

const fetchLatestCustomers = async (options: {
  token: string;
  instance_type: (typeof PADDLE_INSTANCE_TYPE)[keyof typeof PADDLE_INSTANCE_TYPE];
  status?: Status;
  search?: string;
}) => {
  const { token, instance_type, status, search } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const client = createPaddleClient(token, instance_type);

    const customerCollection = client.customers.list({
      perPage: limit,
      orderBy: 'created_at[DESC]',
      ...(status && { status: [status] }),
      ...(search && { search }),
    });

    const result = await customerCollection.next();

    return result || [];
  } catch (error) {
    throw new PaddleError(`Failed to fetch latest customers: ${error.message || error}`);
  }
};
