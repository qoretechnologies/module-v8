import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient } from '../../helpers/constants';
import { getQuickbooksEstimateIdAllowedValues } from '../../helpers/get-estimate-id-allowed-values';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getQuickbooksEstimateIdAllowedValues,
  },
} satisfies TQoreOptions;

const getEstimate = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'get_estimate',
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
      const response = await client.getEstimate(id);

      return response.Estimate;
    } catch (error) {
      throw new QuickbooksError(`Failed to get estimate: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
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
                          PercentBased: { type: 'boolean' },
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
    },
  },
});

export default getEstimate;
