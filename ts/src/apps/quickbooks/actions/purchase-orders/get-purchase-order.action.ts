import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient } from '../../helpers/constants';
import { getQuickbooksPurchaseOrderIdAllowedValues } from '../../helpers/get-purchase-order-id-allowed-values';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getQuickbooksPurchaseOrderIdAllowedValues,
  },
} satisfies TQoreOptions;

const getPurchaseOrder = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'get_purchase_order',
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
      const response = await client.getPurchaseOrder(id);

      return response.PurchaseOrder;
    } catch (error) {
      throw new QuickbooksError(`Failed to get purchase order: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      VendorAddr: {
        type: {
          type: 'hash',
          fields: {
            Id: { type: 'string' },
            Line1: { type: 'string' },
            Line2: { type: 'string' },
            Line3: { type: 'string' },
            Line4: { type: 'string' },
            Lat: { type: 'string' },
            Long: { type: 'string' },
          },
        },
      },
      ShipAddr: {
        type: {
          type: 'hash',
          fields: {
            Id: { type: 'string' },
            Line1: { type: 'string' },
            Line2: { type: 'string' },
            Line3: { type: 'string' },
            Lat: { type: 'string' },
            Long: { type: 'string' },
          },
        },
      },
      EmailStatus: { type: 'string' },
      POStatus: { type: 'string' },
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
      CustomField: {
        type: {
          type: 'list',
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
      LinkedTxn: {
        type: {
          type: 'list',
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
              Description: { type: 'string' },
              Amount: { type: 'number' },
              DetailType: { type: 'string' },
              ItemBasedExpenseLineDetail: {
                type: {
                  type: 'hash',
                  fields: {
                    BillableStatus: { type: 'string' },
                    ItemRef: {
                      type: {
                        type: 'hash',
                        fields: {
                          value: { type: 'string' },
                          name: { type: 'string' },
                        },
                      },
                    },
                    UnitPrice: { type: 'number' },
                    Qty: { type: 'number' },
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

export default getPurchaseOrder;
