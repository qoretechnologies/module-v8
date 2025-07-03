import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient } from '../../helpers/constants';
import { getQuickbooksBillIdAllowedValues } from '../../helpers/get-bill-id-allowed-values';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getQuickbooksBillIdAllowedValues,
  },
} satisfies TQoreOptions;

const getBill = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'get_bill',
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
      const response = await client.getBill(id);

      return response.Bill;
    } catch (error) {
      throw new QuickbooksError(`Failed to get bill: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      DueDate: { type: 'string' },
      VendorAddr: {
        type: {
          type: 'hash',
          fields: {
            Id: { type: 'string' },
            Line1: { type: 'string' },
            City: { type: 'string' },
            CountrySubDivisionCode: { type: 'string' },
            PostalCode: { type: 'string' },
            Lat: { type: 'string' },
            Long: { type: 'string' },
          },
        },
      },
      Balance: { type: 'number' },
      domain: { type: 'string' },
      sparse: { type: 'boolean' },
      Id: { type: 'string' },
      SyncToken: { type: 'string' },
      MetaData: {
        type: {
          type: 'hash',
          fields: {
            CreateTime: { type: 'string' },
            LastModifiedByRef: {
              type: {
                type: 'hash',
                fields: {
                  value: { type: 'string' },
                },
              },
            },
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
      Line: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              Id: { type: 'string' },
              LineNum: { type: 'integer' },
              Amount: { type: 'number' },
              LinkedTxn: {
                type: {
                  type: 'list',
                },
              },
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
      VendorRef: {
        type: {
          type: 'hash',
          fields: {
            value: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
      APAccountRef: {
        type: {
          type: 'hash',
          fields: {
            value: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
      TotalAmt: { type: 'number' },
    },
  },
});

export default getBill;
