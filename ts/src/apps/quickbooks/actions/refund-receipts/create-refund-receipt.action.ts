import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../../helpers/constants';
import { getQuickbooksClassIdAllowedValues } from '../../helpers/get-class-id-allowed-values';
import { getQuickbooksCustomerIdAllowedValues } from '../../helpers/get-customer-id-allowed-values';
import { getQuickbooksItemIdAllowedValues } from '../../helpers/get-item-id-allowed-values';
import { getQuickbooksTaxCodeIdAllowedValues } from '../../helpers/get-tax-code-id-allowed-values';

const options = {
  customer_id: {
    type: 'string',
    required: true,
    get_allowed_values: getQuickbooksCustomerIdAllowedValues,
  },
  lines: {
    required: true,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          amount: { type: 'number', required: true },
          description: { type: 'string', required: false },
          quantity: { type: 'number', required: false },
          unit_price: { type: 'number', required: false },
          item_id: {
            type: 'string',
            required: false,
            get_allowed_values: getQuickbooksItemIdAllowedValues,
          },
          tax_code_id: {
            type: 'string',
            required: false,
            get_allowed_values: getQuickbooksTaxCodeIdAllowedValues,
          },
          class_id: {
            type: 'string',
            required: false,
            get_allowed_values: getQuickbooksClassIdAllowedValues,
          },
        },
      },
    },
  },
  memo: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const createRefundReceipt = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'create_refund_receipt',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, realm_id, instance_type, customer_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'realm_id', 'instance_type'],
      optionFields: ['customer_id'],
      ErrorClass: QuickbooksError,
    });

    const lines = obj!.lines!;
    const memo = obj?.memo;

    const client = createQuickbooksClient({
      token,
      realm_id,
      instance_type,
    });

    try {
      const response = await client.createRefundReceipt({
        CustomerRef: { value: customer_id },
        Line: lines.map((line) => ({
          DetailType: 'SalesItemLineDetail',
          Amount: line.amount,
          ...(line.description && { Description: line.description }),
          ...(line.quantity != null && { Qty: line.quantity }),
          ...(line.unit_price != null && { UnitPrice: line.unit_price }),
          SalesItemLineDetail: {
            ...(line.item_id && { ItemRef: { value: line.item_id } }),
            ...(line.tax_code_id && { TaxCodeRef: { value: line.tax_code_id } }),
            ...(line.class_id && { ClassRef: { value: line.class_id } }),
          },
        })),
        ...(memo && { PrivateNote: memo }),
      });

      return response.RefundReceipt;
    } catch (error) {
      throw new QuickbooksError(
        `Failed to create refund receipt: ${getQuickbooksErrorMessage(error)}`
      );
    }
  },
  response_type: {
    type: 'hash',
    fields: {
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
      PrivateNote: { type: 'string' },
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
              SalesItemLineDetail: {
                type: {
                  type: 'hash',
                  fields: {
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
                    ItemAccountRef: {
                      type: {
                        type: 'hash',
                        fields: {
                          value: { type: 'string' },
                          name: { type: 'string' },
                        },
                      },
                    },
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
              SubTotalLineDetail: {
                type: {
                  type: 'hash',
                },
              },
            },
          },
        },
      },
      TxnTaxDetail: {
        type: {
          type: 'hash',
          fields: {
            TotalTax: { type: 'number' },
          },
        },
      },
      CustomerRef: {
        type: {
          type: 'hash',
          fields: {
            value: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
      CustomerMemo: {
        type: {
          type: 'hash',
          fields: {
            value: { type: 'string' },
          },
        },
      },
      BillAddr: {
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
      FreeFormAddress: { type: 'bool' },
      TotalAmt: { type: 'number' },
      ApplyTaxAfterDiscount: { type: 'bool' },
      PrintStatus: { type: 'string' },
      BillEmail: {
        type: {
          type: 'hash',
          fields: {
            Address: { type: 'string' },
          },
        },
      },
      Balance: { type: 'number' },
      PaymentMethodRef: {
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
            name: { type: 'string' },
          },
        },
      },
    },
  },
});

export default createRefundReceipt;
