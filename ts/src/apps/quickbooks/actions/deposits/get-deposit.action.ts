import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../../helpers/constants';
import { getQuickbooksDepositIdAllowedValues } from '../../helpers/get-deposit-id-allowed-values';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getQuickbooksDepositIdAllowedValues,
  },
} satisfies TQoreOptions;

const getDeposit = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'get_deposit',
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
      const response = await client.getDeposit(id);

      return response.Deposit;
    } catch (error) {
      throw new QuickbooksError(`Failed to get deposit: ${getQuickbooksErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      DepositToAccountRef: {
        type: {
          type: 'hash',
          fields: {
            value: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
      CashBack: {
        type: {
          type: 'hash',
          fields: {
            AccountRef: {
              type: {
                type: 'hash',
                fields: {
                  value: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
            Amount: { type: 'number' },
            Memo: { type: 'string' },
          },
        },
      },
      TotalAmt: { type: 'number' },
      domain: { type: 'string' },
      sparse: { type: 'boolean' },
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
                      TxnLineId: { type: 'string' },
                    },
                  },
                },
              },
              DepositLineDetail: {
                type: {
                  type: 'hash',
                  fields: {
                    PaymentMethodRef: {
                      type: {
                        type: 'hash',
                        fields: {
                          value: { type: 'string' },
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
    },
  },
});

export default getDeposit;
