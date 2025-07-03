import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient } from '../../helpers/constants';
import { QuickBooksOperatorsAllowedValues } from '../../helpers/get-filter-operator-allowed-values';
import { QuickBooksPaymentFieldsAllowedValues } from '../../helpers/get-payment-fields-allowed-values';

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
          allowed_values: QuickBooksPaymentFieldsAllowedValues,
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
          allowed_values: QuickBooksPaymentFieldsAllowedValues,
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

const listPayments = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'list_payments',
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
      const response = await client.findPayments({
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
        payments: response.QueryResponse.Payment || [],
      };
    } catch (error) {
      throw new QuickbooksError(`Failed to list payments: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      payments: {
        type: {
          type: 'list',
          element_type: {
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
              ProcessPayment: { type: 'boolean' },
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
                                    nil: { type: 'boolean' },
                                    globalScope: { type: 'boolean' },
                                    typeSubstituted: { type: 'boolean' },
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
        },
      },
      total_count: { type: 'integer' },
    },
  },
});

export default listPayments;
