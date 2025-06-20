import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../../constants';
import { createPaddleClient } from '../../helpers/constants';
import { getPaddleCustomerIdAllowedValues } from '../../helpers/get-customer-id-allowed-values';

const options = {
  customer_id: {
    required: true,
    type: 'string',
    get_allowed_values: getPaddleCustomerIdAllowedValues,
  },
} satisfies TQoreOptions;

const getCustomer = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'get_customer',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type, customer_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['customer_id'],
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    try {
      const client = createPaddleClient(token, instance_type);

      const customer = await client.customers.get(customer_id);

      return customer;
    } catch (error) {
      throw new PaddleError(`Failed to get customer: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'integer' },
      name: { type: 'string' },
      email: { type: 'string' },
      marketingConsent: { type: 'boolean' },
      status: { type: 'string' },
      customData: { type: 'hash' },
      locale: { type: 'string' },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
    },
  } satisfies TQoreResponseType,
});

export default getCustomer;
