import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../../helpers/constants';
import { getQuickbooksPurchaseIdAllowedValues } from '../../helpers/get-purchase-id-allowed-values';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getQuickbooksPurchaseIdAllowedValues,
  },
} satisfies TQoreOptions;

const getPurchase = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'get_purchase',
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
      const response = await client.getPurchase(id);

      return response.Purchase;
    } catch (error) {
      throw new QuickbooksError(`Failed to get purchase: ${getQuickbooksErrorMessage(error)}`);
    }
  },
  response_type: {
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
      PaymentType: { type: 'string' },
      EntityRef: {
        type: {
          type: 'hash',
          fields: {
            value: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
          },
        },
      },
      TotalAmt: { type: 'number' },
      PrintStatus: { type: 'string' },
      PurchaseEx: {
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
      DocNumber: { type: 'string' },
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
              Id: { type: 'string' },
              Description: { type: 'string' },
              Amount: { type: 'number' },
              DetailType: { type: 'string' },
              AccountBasedExpenseLineDetail: {
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
                    BillableStatus: { type: 'string' },
                    TaxCodeRef: {
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

export default getPurchase;
