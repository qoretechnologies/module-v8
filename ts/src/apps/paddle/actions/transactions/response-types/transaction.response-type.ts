import { TQoreAppActionOption, TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const paddleTransactionResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    status: { type: 'string' },
    customerId: { type: 'string' },
    addressId: { type: 'string' },
    businessId: { type: 'string' },
    customData: { type: 'hash' },
    currencyCode: { type: 'string' },
    origin: { type: 'string' },
    subscriptionId: { type: 'string' },
    invoiceId: { type: 'string' },
    invoiceNumber: { type: 'string' },
    collectionMode: { type: 'string' },
    discountId: { type: 'string' },
    billingDetails: {
      type: {
        type: 'hash',
        fields: {
          enableCheckout: { type: 'boolean' },
          purchaseOrderNumber: { type: 'string' },
          additionalInformation: { type: 'string' },
          paymentTerms: {
            type: {
              type: 'hash',
              fields: {
                interval: { type: 'string' },
                frequency: { type: 'integer' },
              },
            },
          },
        },
      },
    },
    billingPeriod: {
      type: {
        type: 'hash',
        fields: {
          startsAt: { type: 'string' },
          endsAt: { type: 'string' },
        },
      },
    },
    items: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            price: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  productId: { type: 'string' },
                  description: { type: 'string' },
                  type: { type: 'string' },
                  name: { type: 'string' },
                  billingCycle: {
                    type: {
                      type: 'hash',
                      fields: {
                        interval: { type: 'string' },
                        frequency: { type: 'integer' },
                      },
                    },
                  },
                  trialPeriod: {
                    type: {
                      type: 'hash',
                      fields: {
                        interval: { type: 'string' },
                        frequency: { type: 'integer' },
                      },
                    },
                  },
                  taxMode: { type: 'string' },
                  unitPrice: {
                    type: {
                      type: 'hash',
                      fields: {
                        amount: { type: 'string' },
                        currencyCode: { type: 'string' },
                      },
                    },
                  },
                  unitPriceOverrides: {
                    type: {
                      type: 'list',
                      element_type: {
                        type: 'hash',
                        fields: {
                          countryCodes: { type: { type: 'list', element_type: 'string' } },
                          unitPrice: {
                            type: {
                              type: 'hash',
                              fields: {
                                amount: { type: 'string' },
                                currencyCode: { type: 'string' },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  quantity: {
                    type: {
                      type: 'hash',
                      fields: {
                        minimum: { type: 'integer' },
                        maximum: { type: 'integer' },
                      },
                    },
                  },
                  status: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  customData: { type: 'hash' },
                  importMeta: { type: 'hash' },
                  product: { type: 'hash' },
                },
              },
            },
            quantity: { type: 'integer' },
            proration: { type: 'hash' },
          },
        },
      },
    },
    details: {
      type: {
        type: 'hash',
        fields: {
          taxRatesUsed: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  taxRate: { type: 'string' },
                  totals: {
                    type: {
                      type: 'hash',
                      fields: {
                        subtotal: { type: 'string' },
                        discount: { type: 'string' },
                        tax: { type: 'string' },
                        total: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          totals: {
            type: {
              type: 'hash',
              fields: {
                subtotal: { type: 'string' },
                discount: { type: 'string' },
                tax: { type: 'string' },
                total: { type: 'string' },
                credit: { type: 'string' },
                creditToBalance: { type: 'string' },
                balance: { type: 'string' },
                grandTotal: { type: 'string' },
                fee: { type: 'string' },
                earnings: { type: 'string' },
                currencyCode: { type: 'string' },
              },
            },
          },
          adjustedTotals: {
            type: {
              type: 'hash',
              fields: {
                subtotal: { type: 'string' },
                tax: { type: 'string' },
                total: { type: 'string' },
                grandTotal: { type: 'string' },
                fee: { type: 'string' },
                earnings: { type: 'string' },
                currencyCode: { type: 'string' },
              },
            },
          },
          payoutTotals: { type: 'hash' },
          adjustedPayoutTotals: { type: 'hash' },
          lineItems: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  priceId: { type: 'string' },
                  quantity: { type: 'integer' },
                  proration: { type: 'hash' },
                  taxRate: { type: 'string' },
                  unitTotals: {
                    type: {
                      type: 'hash',
                      fields: {
                        subtotal: { type: 'string' },
                        discount: { type: 'string' },
                        tax: { type: 'string' },
                        total: { type: 'string' },
                      },
                    },
                  },
                  totals: {
                    type: {
                      type: 'hash',
                      fields: {
                        subtotal: { type: 'string' },
                        discount: { type: 'string' },
                        tax: { type: 'string' },
                        total: { type: 'string' },
                      },
                    },
                  },
                  product: {
                    type: {
                      type: 'hash',
                      fields: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        type: { type: 'string' },
                        description: { type: 'string' },
                        taxCategory: { type: 'string' },
                        imageUrl: { type: 'string' },
                        customData: { type: 'hash' },
                        status: { type: 'string' },
                        createdAt: { type: 'string' },
                        updatedAt: { type: 'string' },
                        importMeta: { type: 'hash' },
                        prices: { type: 'hash' },
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
    payments: { type: { type: 'list', element_type: 'hash' } },
    checkout: {
      type: {
        type: 'hash',
        fields: {
          url: { type: 'string' },
        },
      },
    },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    billedAt: { type: 'string' },
    revisedAt: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const paddleDiscountResponseType = {
  discount: {
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        status: { type: 'string' },
        description: { type: 'string' },
        enabledForCheckout: { type: 'boolean' },
        code: { type: 'string' },
        mode: { type: 'string' },
        type: { type: 'string' },
        amount: { type: 'string' },
        currencyCode: { type: 'string' },
        recur: { type: 'boolean' },
        maximumRecurringIntervals: { type: 'integer' },
        usageLimit: { type: 'integer' },
        restrictTo: { type: 'hash' },
        expiresAt: { type: 'string' },
        customData: { type: 'hash' },
        timesUsed: { type: 'integer' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        importMeta: { type: 'hash' },
      },
    },
  },
} satisfies Record<string, TQoreAppActionOption>;

export const paddleCustomerResponseType = {
  customer: {
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        marketingConsent: { type: 'boolean' },
        status: { type: 'string' },
        customData: { type: 'hash' },
        locale: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        importMeta: { type: 'hash' },
      },
    },
  },
} satisfies Record<string, TQoreAppActionOption>;

export const paddleBusinessResponseType = {
  business: {
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        customerId: { type: 'string' },
        name: { type: 'string' },
        companyNumber: { type: 'string' },
        taxIdentifier: { type: 'string' },
        status: { type: 'string' },
        contacts: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
          },
        },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        customData: { type: 'hash' },
        importMeta: { type: 'hash' },
      },
    },
  },
} satisfies Record<string, TQoreAppActionOption>;

export const paddleAvailablePaymentMethodsResponseType = {
  availablePaymentMethods: { type: { type: 'list', element_type: 'string' } },
} satisfies Record<string, TQoreAppActionOption>;

export const paddleAdjustmentsResponseType = {
  adjustments: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          action: { type: 'string' },
          type: { type: 'string' },
          reversal_event_id: { type: 'string' },
          transaction_id: { type: 'string' },
          subscription_id: { type: 'string' },
          customer_id: { type: 'string' },
          reason: { type: 'string' },
          currency_code: { type: 'string' },
          status: { type: 'string' },
          items: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  item_id: { type: 'string' },
                  type: { type: 'string' },
                  amount: { type: 'string' },
                  proration: { type: 'hash' },
                  totals: {
                    type: {
                      type: 'hash',
                      fields: {
                        subtotal: { type: 'string' },
                        tax: { type: 'string' },
                        total: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          tax_rates_used: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  tax_rate: { type: 'string' },
                  totals: {
                    type: {
                      type: 'hash',
                      fields: {
                        subtotal: { type: 'string' },
                        tax: { type: 'string' },
                        total: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          totals: {
            type: {
              type: 'hash',
              fields: {
                subtotal: { type: 'string' },
                tax: { type: 'string' },
                total: { type: 'string' },
                fee: { type: 'string' },
                earnings: { type: 'string' },
                currency_code: { type: 'string' },
              },
            },
          },
          payout_totals: {
            type: {
              type: 'hash',
              fields: {
                subtotal: { type: 'string' },
                tax: { type: 'string' },
                total: { type: 'string' },
                fee: { type: 'string' },
                earnings: { type: 'string' },
                currency_code: { type: 'string' },
              },
            },
          },
          created_at: { type: 'string' },
          updated_at: { type: 'string' },
        },
      },
    },
  },
} satisfies Record<string, TQoreAppActionOption>;

export const paddleAdjustmentTotalsResponseType = {
  adjustmentsTotals: {
    type: {
      type: 'hash',
      fields: {
        subtotal: { type: 'string' },
        tax: { type: 'string' },
        total: { type: 'string' },
        fee: { type: 'string' },
        earnings: { type: 'string' },
        breakdown: {
          type: {
            type: 'hash',
            fields: {
              credit: { type: 'string' },
              refund: { type: 'string' },
              chargeback: { type: 'string' },
            },
          },
        },
        currencyCode: { type: 'string' },
      },
    },
  },
} satisfies Record<string, TQoreAppActionOption>;

export const paddleAddressResponseType = {
  address: {
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        customerId: { type: 'string' },
        description: { type: 'string' },
        firstLine: { type: 'string' },
        secondLine: { type: 'string' },
        city: { type: 'string' },
        postalCode: { type: 'string' },
        region: { type: 'string' },
        countryCode: { type: 'string' },
        customData: { type: 'hash' },
        status: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        importMeta: { type: 'hash' },
      },
    },
  },
} satisfies Record<string, TQoreAppActionOption>;

type TPaddleTransactionIncludeFields =
  | 'address'
  | 'adjustments'
  | 'adjustments_totals'
  | 'available_payment_methods'
  | 'business'
  | 'customer'
  | 'discount';

export const getPaddleTransactionResponseTypeField = (
  field: TPaddleTransactionIncludeFields
): Record<string, TQoreAppActionOption> => {
  switch (field) {
    case 'address':
      return paddleAddressResponseType;
    case 'adjustments':
      return paddleAdjustmentsResponseType;
    case 'adjustments_totals':
      return paddleAdjustmentTotalsResponseType;
    case 'available_payment_methods':
      return paddleAvailablePaymentMethodsResponseType;
    case 'business':
      return paddleBusinessResponseType;
    case 'customer':
      return paddleCustomerResponseType;
    case 'discount':
      return paddleDiscountResponseType;
  }
};
