import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../../helpers/constants';
import { QuickBooksOperatorsAllowedValues } from '../../helpers/get-filter-operator-allowed-values';
import { QuickBooksSalesReceiptFieldsAllowedValues } from '../../helpers/get-sales-receipt-fields-allowed-values';

const options = {
  fetchAll: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
  offset: {
    type: 'integer',
    required: false,
    default_value: 0,
  },
  filter: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          allowed_values: QuickBooksSalesReceiptFieldsAllowedValues,
        },
        operator: {
          type: 'string',
          required: false,
          allowed_values: QuickBooksOperatorsAllowedValues,
        },
        value: { type: 'softstring', required: true },
      },
    },
  },
  sort: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          allowed_values: QuickBooksSalesReceiptFieldsAllowedValues,
        },
        direction: {
          type: 'string',
          required: false,
          default_value: 'asc',
          allowed_values: [
            { value: 'asc', display_name: 'Ascending' },
            { value: 'desc', display_name: 'Descending' },
          ],
        },
      },
    },
  },
} satisfies TQoreOptions;

const listSalesReceipts = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'list_sales_receipts',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, realm_id, instance_type } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'realm_id', 'instance_type'],
      ErrorClass: QuickbooksError,
    });

    const limit = obj?.limit || 50;
    const offset = obj?.offset || 0;
    const filter = obj?.filter;
    const sort = obj?.sort;
    const fetchAll = obj?.fetchAll || false;

    const client = createQuickbooksClient({
      token,
      realm_id,
      instance_type,
    });

    try {
      const response = await client.findSalesReceipts({
        limit,
        offset,
        fetchAll,
        ...(filter && {
          field: filter.field,
          operator: filter.operator || '=',
          value: filter.value,
        }),
        ...(sort && {
          [sort.direction]: sort.field,
        }),
      });

      return {
        total_count: response.QueryResponse.maxResults,
        sales_receipts: response.QueryResponse.SalesReceipt || [],
      };
    } catch (error) {
      throw new QuickbooksError(
        `Failed to list sales receipts: ${getQuickbooksErrorMessage(error)}`
      );
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      sales_receipts: {
        type: {
          type: 'list',
          element_type: {
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
                    Lat: { type: 'string' },
                    Long: { type: 'string' },
                  },
                },
              },
              FreeFormAddress: { type: 'bool' },
              TotalAmt: { type: 'number' },
              ApplyTaxAfterDiscount: { type: 'bool' },
              PrintStatus: { type: 'string' },
              EmailStatus: { type: 'string' },
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
              PaymentRefNum: { type: 'string' },
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
        },
      },
      total_count: { type: 'integer' },
    },
  },
});

export default listSalesReceipts;
