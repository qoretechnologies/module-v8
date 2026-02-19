import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../../helpers/constants';
import { getQuickbooksCustomerIdAllowedValues } from '../../helpers/get-customer-id-allowed-values';
import { getQuickbooksInvoiceIdAllowedValues } from '../../helpers/get-invoice-id-allowed-values';

const options = {
  customer: {
    type: 'string',
    required: true,
    get_allowed_values: getQuickbooksCustomerIdAllowedValues,
  },
  total_amount: {
    type: 'number',
    required: true,
  },
  invoice_ids: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getQuickbooksInvoiceIdAllowedValues,
  },
  payment_date: {
    type: 'date',
    required: false,
  },
  memo: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const createPayment = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'create_payment',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, realm_id, instance_type, customer, total_amount } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'realm_id', 'instance_type'],
      optionFields: ['customer', 'total_amount'],
      ErrorClass: QuickbooksError,
    });

    const invoiceIds = obj?.invoice_ids;
    const paymentDate = obj?.payment_date;
    const memo = obj?.memo;

    const client = createQuickbooksClient({
      token,
      realm_id,
      instance_type,
    });

    try {
      const paymentData: Record<string, unknown> = {
        CustomerRef: { value: customer },
        TotalAmt: total_amount,
      };

      if (invoiceIds && invoiceIds.length > 0) {
        paymentData.Line = invoiceIds.map((invoiceId) => ({
          Amount: total_amount / invoiceIds.length,
          LinkedTxn: [
            {
              TxnId: invoiceId,
              TxnType: 'Invoice',
            },
          ],
        }));
      }

      if (paymentDate) {
        paymentData.TxnDate = paymentDate;
      }

      if (memo) {
        paymentData.PrivateNote = memo;
      }

      const response = await client.createPayment(paymentData);

      return response.Payment;
    } catch (error) {
      throw new QuickbooksError(`Failed to create payment: ${getQuickbooksErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      CustomerRef: {
        type: {
          type: 'hash',
          fields: {
            value: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
      DepositToAccountRef: {
        type: {
          type: 'hash',
          fields: {
            value: { type: 'string' },
          },
        },
      },
      PaymentMethodRef: {
        type: {
          type: 'hash',
          fields: {
            value: { type: 'string' },
          },
        },
      },
      PaymentRefNum: { type: 'string' },
      TotalAmt: { type: 'number' },
      UnappliedAmt: { type: 'number' },
      ProcessPayment: { type: 'bool' },
      domain: { type: 'string' },
      sparse: { type: 'bool' },
      Id: { type: 'string' },
      SyncToken: { type: 'string' },
      MetaData: {
        type: {
          type: 'hash',
          fields: {
            CreateTime: { type: 'string' },
            LastUpdatedTime: { type: 'string' },
          },
        },
      },
      TxnDate: { type: 'string' },
      CurrencyRef: {
        type: {
          type: 'hash',
          fields: {
            value: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
      PrivateNote: { type: 'string' },
      Line: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              Amount: { type: 'number' },
              LinkedTxn: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      TxnId: { type: 'string' },
                      TxnType: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export default createPayment;
