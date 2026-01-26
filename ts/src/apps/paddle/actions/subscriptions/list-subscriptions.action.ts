import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../../constants';
import { createPaddleClient } from '../../helpers/constants';
import { getPaddleSubscriptionIdAllowedValues } from '../../helpers/get-subscription-id-allowed-values';
import { paddleSubscriptionResponseType } from './response-types/subscription.response-type';
import { getPaddleCustomerIdAllowedValues } from '../../helpers/get-customer-id-allowed-values';
import { getPaddleCustomerAddressIdAllowedValues } from '../../helpers/get-customer-address-id-allowed-values';
import { getPaddlePriceIdAllowedValues } from '../../helpers/get-price-id-allowed-values';
import { CollectionMode, ScheduledChangeAction, SubscriptionStatus } from '@paddle/paddle-node-sdk';
import { PaddleSubscriptionStatusAllowedValues } from '../../helpers/get-subscription-status-allowed-values';

const options = {
  customer_id: {
    type: 'string',
    required: false,
    get_allowed_values: getPaddleCustomerIdAllowedValues,
    on_change: ['refetch'],
  },
  address_id: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    depends_on: ['customer_id'],
    get_element_allowed_values: getPaddleCustomerAddressIdAllowedValues,
  },
  after: {
    type: 'string',
    required: false,
  },
  collection_mode: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'automatic', display_name: 'Automatic' },
      { value: 'manual', display_name: 'Manual' },
    ],
  },
  id: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
    get_element_allowed_values: getPaddleSubscriptionIdAllowedValues,
  },
  order: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values: [
            {
              value: 'id',
              display_name: 'ID',
            },
          ],
        },
        direction: {
          type: 'string',
          preselected: true,
          allowed_values: [
            { value: 'ASC', display_name: 'Ascending' },
            { value: 'DESC', display_name: 'Descending' },
          ],
        },
      },
    },
  },
  per_page: {
    type: 'integer',
    default_value: 50,
    required: false,
  },
  price_id: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getPaddlePriceIdAllowedValues,
    required: false,
  },

  scheduled_change_action: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: [
      { value: 'cancel', display_name: 'Cancel' },
      { value: 'pause', display_name: 'Pause' },
      { value: 'resume', display_name: 'Resume' },
    ],
  },
  status: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: PaddleSubscriptionStatusAllowedValues,
  },
} satisfies TQoreOptions;

const listSubscriptions = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'list_subscriptions',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const customerId = obj?.customer_id;
    const addressId = obj?.address_id;
    const after = obj?.after;
    const collectionMode = obj?.collection_mode as CollectionMode | undefined;
    const id = obj?.id;
    const priceId = obj?.price_id;
    const scheduledChangeAction = obj?.scheduled_change_action as
      | ScheduledChangeAction[]
      | undefined;
    const status = obj?.status as SubscriptionStatus[] | undefined;
    const perPage = obj?.per_page ? Math.min(obj.per_page, 200) : 50;
    const sortOrder = obj?.order?.direction || 'DESC';
    const sortField = obj?.order?.field;

    try {
      const client = createPaddleClient(token, instance_type);

      const subscriptionCollection = await client.subscriptions.list({
        perPage,
        ...(sortField && { orderBy: `${sortField}[${sortOrder}]` }),
        ...(customerId && { customerId: [customerId] }),
        ...(addressId && { addressId }),
        ...(after && { after }),
        ...(collectionMode && { collectionMode }),
        ...(id && { id }),
        ...(priceId && { priceId }),
        ...(scheduledChangeAction && { scheduledChangeAction }),
        ...(status && { status }),
      });

      return await subscriptionCollection.next();
    } catch (error) {
      throw new PaddleError(`Failed to list subscriptions: ${error.message || error}`);
    }
  },
  response_type: paddleSubscriptionResponseType,
});

export default listSubscriptions;
