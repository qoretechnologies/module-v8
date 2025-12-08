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

const getPayment = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'get_payment',
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
      const response = await client.getPayment(id);

      return response.Payment;
    } catch (error) {
      throw new QuickbooksError(`Failed to get payment: ${getQuickbooksErrorMessage(error)}`);
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
              LineEx: {
                type: {
                  type: 'hash',
                  fields: {
                    any: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            name: { type: 'string' },
                            declaredType: { type: 'string' },
                            scope: { type: 'string' },
                            value: {
                              type: {
                                type: 'hash',
                                fields: {
                                  Name: { type: 'string' },
                                  Value: { type: 'string' },
                                },
                              },
                            },
                            nil: { type: 'bool' },
                            globalScope: { type: 'bool' },
                            typeSubstituted: { type: 'bool' },
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
  },
});

export default getPayment;
