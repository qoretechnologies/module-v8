import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient } from '../../helpers/constants';
import { QuickBooksOperatorsAllowedValues } from '../../helpers/get-filter-operator-allowed-values';
import { QuickBooksCreditMemoFieldsAllowedValues } from '../../helpers/get-credit-memo-fields-allowed-values';

const options = {
  fetchAll: {
    type: 'boolean',
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
          allowed_values: QuickBooksCreditMemoFieldsAllowedValues,
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
          allowed_values: QuickBooksCreditMemoFieldsAllowedValues,
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

const listCreditMemos = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'list_credit_memos',
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
      const response = await client.findCreditMemos({
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
        credit_memos: response.QueryResponse.CreditMemo || [],
      };
    } catch (error) {
      throw new QuickbooksError(`Failed to list credit memos: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      credit_memos: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              RemainingCredit: { type: 'number' },
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
                    City: { type: 'string' },
                    CountrySubDivisionCode: { type: 'string' },
                    PostalCode: { type: 'string' },
                    Lat: { type: 'string' },
                    Long: { type: 'string' },
                  },
                },
              },
              FreeFormAddress: { type: 'boolean' },
              TotalAmt: { type: 'number' },
              ApplyTaxAfterDiscount: { type: 'boolean' },
              PrintStatus: { type: 'string' },
              EmailStatus: { type: 'string' },
              BillEmail: {
                type: {
                  type: 'hash',
                  fields: {
                    Address: { type: 'string' },
                  },
                },
              },
              Balance: { type: 'number' },
            },
          },
        },
      },
      total_count: { type: 'integer' },
    },
  },
});

export default listCreditMemos;
