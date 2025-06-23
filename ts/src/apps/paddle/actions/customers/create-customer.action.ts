import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../../constants';
import { createPaddleClient } from '../../helpers/constants';

const options = {
  email: {
    required: true,
    type: 'string',
  },
  name: {
    required: false,
    type: 'string',
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

const createCustomer = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'create_customer',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type, email } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['email'],
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const name = obj?.name;
    const locale = obj?.locale;
    const customData = obj?.custom_data;

    try {
      const client = createPaddleClient(token, instance_type);

      const customer = await client.customers.create({
        email,
        ...(name && { name }),
        ...(locale && { locale }),
        ...(customData && { customData }),
      });

      return customer;
    } catch (error) {
      throw new PaddleError(`Failed to create customer: ${error.message || error}`);
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

export default createCustomer;
