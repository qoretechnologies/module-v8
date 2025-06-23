import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../../constants';
import { createPaddleClient } from '../../helpers/constants';
import { PaddleCurrencyAllowedValues } from '../../helpers/get-currency-allowed-values';
import { getPaddleCustomerIdAllowedValues } from '../../helpers/get-customer-id-allowed-values';

const options = {
  customer_id: {
    required: true,
    type: 'string',
    get_allowed_values: getPaddleCustomerIdAllowedValues,
  },
  currency_code: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'string',
      },
    },
    element_allowed_values: PaddleCurrencyAllowedValues,
  },
} satisfies TQoreOptions;

const listCustomerCreditBalances = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'list_customer_credit_balances',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type, customer_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['customer_id'],
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const currencyCode = obj?.currency_code;

    try {
      const client = createPaddleClient(token, instance_type);

      const customerCreditBalances = await client.customers.getCreditBalance(customer_id, {
        ...(currencyCode && { currencyCode }),
      });

      return customerCreditBalances;
    } catch (error) {
      throw new PaddleError(`Failed to list customer credit balances: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      customerId: { type: 'string' },
      currencyCode: { type: 'string' },
      balance: {
        type: {
          type: 'hash',
          fields: {
            available: { type: 'string' },
            reserved: { type: 'string' },
            total: { type: 'string' },
          },
        },
      },
    },
  } satisfies TQoreResponseType,
});

export default listCustomerCreditBalances;
