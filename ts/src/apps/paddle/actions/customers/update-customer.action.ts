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
import { PaddleStatusAllowedValues } from '../../helpers/get-status-allowed-values';
import { Status } from '@paddle/paddle-node-sdk';

const options = {
  customer_id: {
    required: true,
    type: 'string',
    get_allowed_values: getPaddleCustomerIdAllowedValues,
  },
  email: {
    required: false,
    type: 'string',
  },
  name: {
    required: false,
    type: 'string',
  },
  status: {
    required: false,
    type: 'string',
    allowed_values: PaddleStatusAllowedValues,
  },
  locale: {
    required: false,
    type: 'string',
    allowed_values: [
      { value: 'en', display_name: 'English' },
      { value: 'fr', display_name: 'French' },
      { value: 'de', display_name: 'German' },
      { value: 'es', display_name: 'Spanish' },
      { value: 'it', display_name: 'Italian' },
      { value: 'pt', display_name: 'Portuguese' },
    ],
    allowed_values_creatable: true,
  },
  custom_data: {
    required: false,
    type: 'hash',
  },
} satisfies TQoreOptions;

const updateCustomer = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'update_customer',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type, customer_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['customer_id'],
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const name = obj?.name;
    const email = obj?.email;
    const status = obj?.status as Status | undefined;
    const locale = obj?.locale;
    const customData = obj?.custom_data;

    try {
      const client = createPaddleClient(token, instance_type);

      const customer = await client.customers.update(customer_id, {
        ...(email && { email }),
        ...(status && { status }),
        ...(name && { name }),
        ...(locale && { locale }),
        ...(customData && { customData }),
      });

      return customer;
    } catch (error) {
      throw new PaddleError(`Failed to update customer: ${error.message || error}`);
    }
  },
  response_type: {
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
  } satisfies TQoreResponseType,
});

export default updateCustomer;
