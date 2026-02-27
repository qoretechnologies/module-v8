import { EQoreAppActionCode, IQoreAllowedValue, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../helpers/constants';

const VOIDABLE_TRANSACTION_TYPES = ['Invoice', 'Payment', 'SalesReceipt', 'BillPayment'] as const;

const transactionTypeAllowedValues: IQoreAllowedValue<string>[] = VOIDABLE_TRANSACTION_TYPES.map(
  (type) => ({
    value: type,
    display_name: type,
  })
);

const options = {
  transaction_type: {
    type: 'string',
    required: true,
    allowed_values: transactionTypeAllowedValues,
  },
  transaction_id: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const voidTransaction = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'void_transaction',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, realm_id, instance_type, transaction_type, transaction_id } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['token', 'realm_id', 'instance_type'],
        optionFields: ['transaction_type', 'transaction_id'],
        ErrorClass: QuickbooksError,
      });

    if (!VOIDABLE_TRANSACTION_TYPES.includes(transaction_type as (typeof VOIDABLE_TRANSACTION_TYPES)[number])) {
      throw new QuickbooksError(
        `Unsupported transaction type: ${transaction_type}. ` +
          `Supported types: ${VOIDABLE_TRANSACTION_TYPES.join(', ')}`
      );
    }

    const client = createQuickbooksClient({
      token,
      realm_id,
      instance_type,
    });

    try {
      let response: Record<string, unknown>;

      switch (transaction_type) {
        case 'Invoice': {
          const result = await client.voidInvoice(transaction_id);
          response = result.Invoice as unknown as Record<string, unknown>;
          break;
        }
        case 'Payment': {
          const payment = await client.getPayment(transaction_id);
          const result = await client.voidPayment({
            Id: transaction_id,
            SyncToken: payment.Payment.SyncToken,
          });
          response = result.Payment as unknown as Record<string, unknown>;
          break;
        }
        default: {
          const entityName = transaction_type as 'SalesReceipt' | 'BillPayment';
          const result = await (client as unknown as Record<string, Function>).void(
            entityName,
            transaction_id
          );
          response = result[entityName] as Record<string, unknown>;
          break;
        }
      }

      return response;
    } catch (error) {
      throw new QuickbooksError(
        `Failed to void ${transaction_type}: ${getQuickbooksErrorMessage(error)}`
      );
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      Id: { type: 'string' },
      SyncToken: { type: 'string' },
      domain: { type: 'string' },
      sparse: { type: 'bool' },
      TotalAmt: { type: 'number' },
      Balance: { type: 'number' },
      PrivateNote: { type: 'string' },
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
      DocNumber: { type: 'string' },
      CustomerRef: {
        type: {
          type: 'hash',
          fields: {
            value: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
      Line: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              Amount: { type: 'number' },
              DetailType: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default voidTransaction;
