import { CollectionMode, ScheduledChangeAction, SubscriptionStatus } from '@paddle/paddle-node-sdk';
import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { paddleSubscriptionResponseType } from '../actions/subscriptions/response-types/subscription.response-type';
import { PADDLE_APP_NAME, PADDLE_INSTANCE_TYPE, PaddleError } from '../constants';
import { createPaddleClient } from '../helpers/constants';
import { getPaddleCustomerIdAllowedValues } from '../helpers/get-customer-id-allowed-values';
import { getPaddlePriceIdAllowedValues } from '../helpers/get-price-id-allowed-values';
import { PaddleSubscriptionStatusAllowedValues } from '../helpers/get-subscription-status-allowed-values';

const PaddleNewSubscriptionTrigger = QoreAppCreator.createLocalizedTrigger({
  app: PADDLE_APP_NAME,
  action: 'new_subscription',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    customer_id: {
      type: 'string',
      required: false,
      get_allowed_values: getPaddleCustomerIdAllowedValues,
    },
    price_id: {
      type: {
        type: 'list',
        element_type: 'string',
      },
      required: false,
      get_element_allowed_values: getPaddlePriceIdAllowedValues,
    },
    status: {
      type: {
        type: 'list',
        element_type: 'string',
      },
      required: false,
      element_allowed_values: PaddleSubscriptionStatusAllowedValues,
    },
    collection_mode: {
      type: 'string',
      required: false,
      allowed_values: [
        { value: 'automatic', display_name: 'Automatic' },
        { value: 'manual', display_name: 'Manual' },
      ],
    },
    scheduled_change_action: {
      type: {
        type: 'list',
        element_type: 'string',
      },
      required: false,
      element_allowed_values: [
        { value: 'cancel', display_name: 'Cancel' },
        { value: 'pause', display_name: 'Pause' },
        { value: 'resume', display_name: 'Resume' },
      ],
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, instance_type } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const { customer_id, price_id, status, collection_mode, scheduled_change_action } =
      context.opts || {};

    const getItems = () => {
      return fetchLatestSubscriptions({
        token,
        instance_type,
        customer_id,
        price_id,
        status: status as SubscriptionStatus[] | undefined,
        collection_mode: collection_mode as CollectionMode | undefined,
        scheduled_change_action: scheduled_change_action as ScheduledChangeAction[] | undefined,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'paddle_new_subscription',
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

    const { customer_id, price_id, status, collection_mode, scheduled_change_action } =
      context.opts || {};

    const subscriptions = await fetchLatestSubscriptions({
      token,
      instance_type,
      customer_id,
      price_id: price_id as string[] | undefined,
      status: status as SubscriptionStatus[] | undefined,
      collection_mode: collection_mode as CollectionMode | undefined,
      scheduled_change_action: scheduled_change_action as ScheduledChangeAction[] | undefined,
    });

    return subscriptions?.length > 0 ? subscriptions[0] : null;
  },
  event_info: {
    desc: 'Paddle New Subscription Trigger Event Info',
    type: paddleSubscriptionResponseType,
  },
});

export default PaddleNewSubscriptionTrigger;

const fetchLatestSubscriptions = async (options: {
  token: string;
  instance_type: (typeof PADDLE_INSTANCE_TYPE)[keyof typeof PADDLE_INSTANCE_TYPE];
  customer_id?: string;
  price_id?: string[];
  status?: SubscriptionStatus[];
  collection_mode?: CollectionMode;
  scheduled_change_action?: ScheduledChangeAction[];
}) => {
  const {
    token,
    instance_type,
    customer_id,
    price_id,
    status,
    collection_mode,
    scheduled_change_action,
  } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const client = createPaddleClient(token, instance_type);

    const subscriptionCollection = client.subscriptions.list({
      perPage: limit,
      ...(customer_id && { customerId: [customer_id] }),
      ...(price_id && { priceId: price_id }),
      ...(status && { status }),
      ...(collection_mode && { collectionMode: collection_mode }),
      ...(scheduled_change_action && { scheduledChangeAction: scheduled_change_action }),
    });

    const result = await subscriptionCollection.next();

    return result || [];
  } catch (error) {
    throw new PaddleError(`Failed to fetch latest subscriptions: ${error.message || error}`);
  }
};
