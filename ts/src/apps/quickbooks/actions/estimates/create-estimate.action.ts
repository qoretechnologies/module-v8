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
          service_date: { type: 'string', required: false },
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
} satisfies TQoreOptions;

const createEstimate = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'create_estimate',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, realm_id, instance_type, customer_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'realm_id', 'instance_type'],
      optionFields: ['customer_id', 'lines'],
      ErrorClass: QuickbooksError,
    });

    const lines = obj!.lines!;

    const client = createQuickbooksClient({
      token,
      realm_id,
      instance_type,
    });

    try {
      const response = await client.createEstimate({
        CustomerRef: {
          value: customer_id,
        },
        Line: lines.map((line) => ({
          Amount: line.amount,
          DetailType: 'SalesItemLineDetail',
          ...(line.description && { Description: line.description }),
          ...(line.quantity && { Qty: line.quantity }),
          ...(line.unit_price && { UnitPrice: line.unit_price }),
          SalesItemLineDetail: {
            ...(line.item_id && { ItemRef: { value: line.item_id } }),
            ...(line.tax_code_id && { TaxCodeRef: { value: line.tax_code_id } }),
            ...(line.class_id && { ClassRef: { value: line.class_id } }),
          },
          ...(line.service_date && { ServiceDate: line.service_date }),
        })),
      });

      return response.Estimate;
    } catch (error) {
      throw new QuickbooksError(
        `Failed to create an estimate: ${getQuickbooksErrorMessage(error)}`
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
      TxnStatus: { type: 'string' },
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
            TxnTaxCodeRef: {
              type: {
                type: 'hash',
                fields: {
                  value: { type: 'string' },
                },
              },
            },
            TotalTax: { type: 'number' },
            TaxLine: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    Amount: { type: 'number' },
                    DetailType: { type: 'string' },
                    TaxLineDetail: {
                      type: {
                        type: 'hash',
                        fields: {
                          TaxRateRef: {
                            type: {
                              type: 'hash',
                              fields: {
                                value: { type: 'string' },
                              },
                            },
                          },
                          PercentBased: { type: 'bool' },
                          TaxPercent: { type: 'number' },
                          NetAmountTaxable: { type: 'number' },
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
      FreeFormAddress: { type: 'bool' },
      TotalAmt: { type: 'number' },
      ApplyTaxAfterDiscount: { type: 'bool' },
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
    },
  },
});

export default createEstimate;
