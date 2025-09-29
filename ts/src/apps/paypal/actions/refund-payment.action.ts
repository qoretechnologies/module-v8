import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { getPayPalErrorMessage, PAYPAL_APP_NAME, PayPalError } from '../constants';
import { payPalApiClient } from '../helpers/constants';
import { PayPalCurrencyCodesAllowedValues } from '../helpers/get-currency.allowed-values';

const options = {
  capture_id: {
    type: 'string',
    required: true,
  },
  amount: {
    type: {
      type: 'hash',
      fields: {
        currency_code: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          allowed_values: PayPalCurrencyCodesAllowedValues,
        },
        value: {
          type: 'string',
          required: true,
        },
      },
    },
    required: false,
  },
  note_to_payer: {
    type: 'string',
    required: false,
  },
  invoice_id: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const action = 'refund_payment';

const refundPayment = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PAYPAL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, environment, capture_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'environment'],
      optionFields: ['capture_id'],
      ErrorClass: PayPalError,
    });

    const refundBody: Record<string, any> = {};

    if (obj?.amount) {
      refundBody.amount = obj.amount;
    }

    if (obj?.note_to_payer) {
      refundBody.note_to_payer = obj.note_to_payer;
    }

    if (obj?.invoice_id) {
      refundBody.invoice_id = obj.invoice_id;
    }

    try {
      const response = await payPalApiClient<Record<string, any>>({
        path: `v2/payments/captures/${capture_id}/refund`,
        method: 'POST',
        body: Object.keys(refundBody).length > 0 ? refundBody : undefined,
        token,
        environment,
      });

      return omit(response, ['links']);
    } catch (error) {
      throw new PayPalError(
        `Failed to ${humanizeNameTitle(action)}: ${getPayPalErrorMessage(error)}`
      );
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      status: { type: 'string' },
    },
  },
});

export default refundPayment;
