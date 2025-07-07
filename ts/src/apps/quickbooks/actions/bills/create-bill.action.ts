import {
  EQoreAppActionCode,
  QoreAppCreator,
  TCustomConnOptions,
  TQoreAppActionOption,
  TQoreMappedOptions,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../../helpers/constants';
import { getQuickbooksVendorIdAllowedValues } from '../../helpers/get-vendor-id-allowed-values';
import { getQuickbooksAccountIdAllowedValues } from '../../helpers/get-account-id-allowed-values';
import { getQuickbooksTaxCodeIdAllowedValues } from '../../helpers/get-tax-code-id-allowed-values';
import { getQuickbooksClassIdAllowedValues } from '../../helpers/get-class-id-allowed-values';
import { getQuickbooksCustomerIdAllowedValues } from '../../helpers/get-customer-id-allowed-values';
import { getQuickbooksItemIdAllowedValues } from '../../helpers/get-item-id-allowed-values';

type AccountBasedLineItem = TQoreMappedOptions<typeof accountBasedLineItems>['line_items'][number];
type ItemBasedLineItem = TQoreMappedOptions<typeof itemBasedLineItems>['line_items'][number];

const lineItemsCommonOptions = {
  amount: { required: true, type: 'number', default_value: 1 },
  description: {
    type: 'string',
    required: false,
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
  customer_id: {
    type: 'string',
    required: false,
    get_allowed_values: getQuickbooksCustomerIdAllowedValues,
  },
  billable_status: {
    type: 'string',
    default_value: 'NotBillable',
    required: false,
    allowed_values: [
      { value: 'NotBillable', display_name: 'Not Billable' },
      { value: 'Billable', display_name: 'Billable' },
      { value: 'HasBeenBilled', display_name: 'Has Been Billed' },
    ],
  },
} satisfies TQoreOptions;

const accountBasedLineItems = {
  line_items: {
    required: true,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          ...lineItemsCommonOptions,
          account_id: {
            type: 'string',
            required: true,
            get_allowed_values: getQuickbooksAccountIdAllowedValues,
          },
        },
      },
    },
  },
} satisfies TQoreOptions;

const itemBasedLineItems = {
  line_items: {
    type: {
      required: true,
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          item_id: {
            type: 'string',
            required: true,
            get_allowed_values: getQuickbooksItemIdAllowedValues,
          },
          quantity: {
            type: 'number',
            required: false,
            default_value: 1,
          },
          unit_price: {
            type: 'number',
            required: false,
            default_value: 0,
          },
          ...lineItemsCommonOptions,
        },
      },
    },
  },
} satisfies TQoreOptions;

const options = {
  vendor_id: {
    type: 'string',
    required: true,
    get_allowed_values: getQuickbooksVendorIdAllowedValues,
  },
  line_item_type: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'AccountBasedExpenseLineDetail', display_name: 'Account Based Expense Line Detail' },
      { value: 'ItemBasedExpenseLineDetail', display_name: 'Item Based Expense Line Detail' },
    ],
    get_dependent_options: (context) => {
      const line_item_type = context?.opts?.line_item_type;

      if (line_item_type === 'AccountBasedExpenseLineDetail') {
        return accountBasedLineItems;
      }

      if (line_item_type === 'ItemBasedExpenseLineDetail') {
        return itemBasedLineItems;
      }

      return {} as Record<string, TQoreAppActionOption<TCustomConnOptions>>;
    },
  },
} satisfies TQoreOptions;

const createBill = QoreAppCreator.createLocalizedAction<
  | (typeof options & Partial<typeof accountBasedLineItems>)
  | (typeof options & Partial<typeof itemBasedLineItems>)
>({
  app: QUICKBOOKS_APP_NAME,
  action: 'create_bill',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, realm_id, instance_type, vendor_id, line_item_type } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['token', 'realm_id', 'instance_type'],
        optionFields: ['vendor_id', 'line_item_type', 'line_items'],
        ErrorClass: QuickbooksError,
      });

    const line_items = obj?.line_items as Array<ItemBasedLineItem | AccountBasedLineItem>;
    const client = createQuickbooksClient({
      token,
      realm_id,
      instance_type,
    });

    try {
      const response = await client.createBill({
        VendorRef: {
          value: vendor_id,
        },
        ...(line_item_type === 'AccountBasedExpenseLineDetail' && {
          Line: line_items?.map((item: AccountBasedLineItem) => ({
            Amount: item.amount,
            DetailType: line_item_type,
            ...(item.description && { Description: item.description }),
            AccountBasedExpenseLineDetail: {
              AccountRef: {
                value: item.account_id,
              },
              ...(item.tax_code_id && { TaxCodeRef: { value: item.tax_code_id } }),
              ...(item.class_id && { ClassRef: { value: item.class_id } }),
              ...(item.customer_id && { CustomerRef: { value: item.customer_id } }),
              ...(item.billable_status && {
                BillableStatus: item.billable_status as
                  | 'NotBillable'
                  | 'Billable'
                  | 'HasBeenBilled',
              }),
            },
          })),
        }),
        ...(line_item_type === 'ItemBasedExpenseLineDetail' && {
          Line: line_items?.map((item: ItemBasedLineItem) => ({
            Amount: item.amount,
            DetailType: line_item_type,
            ...(item.description && { Description: item.description }),
            ItemBasedExpenseLineDetail: {
              ItemRef: {
                value: item.item_id,
              },
              ...(item.quantity && { Qty: item.quantity }),
              ...(item.unit_price && { UnitPrice: item.unit_price }),
              ...(item.tax_code_id && { TaxCodeRef: { value: item.tax_code_id } }),
              ...(item.class_id && { ClassRef: { value: item.class_id } }),
              ...(item.customer_id && { CustomerRef: { value: item.customer_id } }),
              ...(item.billable_status && {
                BillableStatus: item.billable_status as
                  | 'NotBillable'
                  | 'Billable'
                  | 'HasBeenBilled',
              }),
            },
          })),
        }),
      });

      return response.Bill;
    } catch (error) {
      throw new QuickbooksError(`Failed to create a bill: ${getQuickbooksErrorMessage(error)}`);
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

export default createBill;
