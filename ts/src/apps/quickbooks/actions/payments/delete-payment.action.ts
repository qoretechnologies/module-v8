import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../../helpers/constants';
import { getQuickbooksPaymentIdAllowedValues } from '../../helpers/get-payment-id-allowed-values';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getQuickbooksPaymentIdAllowedValues,
  },
} satisfies TQoreOptions;

const deletePayment = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'delete_payment',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, realm_id, instance_type, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'realm_id', 'instance_type'],
      optionFields: ['id'],
      ErrorClass: QuickbooksError,
    });

    const client = createQuickbooksClient({
      token,
      realm_id,
      instance_type,
    });

    try {
      const payment = await client.getPayment(id);
      const response = await client.deletePayment({
        Id: id,
        SyncToken: payment.Payment.SyncToken,
      });

      return response.Payment;
    } catch (error) {
      throw new QuickbooksError(`Failed to delete payment: ${getQuickbooksErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      Id: { type: 'string' },
      domain: { type: 'string' },
      status: { type: 'string' },
    },
  },
});

export default deletePayment;
