import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../../constants';
import { createPaddleClient } from '../../helpers/constants';
import { getPaddleSubscriptionIdAllowedValues } from '../../helpers/get-subscription-id-allowed-values';
import { paddleSubscriptionResponseType } from './response-types/subscription.response-type';

const options = {
  subscription_id: {
    type: 'string',
    required: true,
    get_allowed_values: getPaddleSubscriptionIdAllowedValues,
  },
  include: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: [
      {
        value: 'next_transaction',
        display_name: 'Next Transaction',
      },
      {
        value: 'recurring_transaction_details',
        display_name: 'Recurring Transaction Details',
      },
    ],
  },
} satisfies TQoreOptions;

const getSubscription = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'get_subscription',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type, subscription_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['subscription_id'],
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const include = obj?.include as
      | Array<'next_transaction' | 'recurring_transaction_details'>
      | undefined;

    try {
      const client = createPaddleClient(token, instance_type);

      const subscription = await client.subscriptions.get(subscription_id, {
        ...(include && { include }),
      });

      return subscription;
    } catch (error) {
      throw new PaddleError(`Failed to get subscription: ${error.message || error}`);
    }
  },
  response_type: paddleSubscriptionResponseType,
});

export default getSubscription;
