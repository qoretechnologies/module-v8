import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const paddleSubscriptionResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    status: { type: 'string' },
    customerId: { type: 'string' },
    addressId: { type: 'string' },
    businessId: { type: 'string' },
    currencyCode: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    startedAt: { type: 'string' },
    firstBilledAt: { type: 'string' },
    nextBilledAt: { type: 'string' },
    pausedAt: { type: 'string' },
    canceledAt: { type: 'string' },
    discount: { type: 'hash' },
    collectionMode: { type: 'string' },
    billingDetails: { type: 'hash' },
    currentBillingPeriod: {
      type: {
        type: 'hash',
        fields: {
          startsAt: { type: 'string' },
          endsAt: { type: 'string' },
        },
      },
    },
    billingCycle: {
      type: {
        type: 'hash',
        fields: {
          interval: { type: 'string' },
          frequency: { type: 'integer' },
        },
      },
    },
    scheduledChange: { type: 'hash' },
    managementUrls: {
      type: {
        type: 'hash',
        fields: {
          updatePaymentMethod: { type: 'string' },
          cancel: { type: 'string' },
        },
      },
    },
    items: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            status: { type: 'string' },
            quantity: { type: 'integer' },
            recurring: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
            previouslyBilledAt: { type: 'string' },
            nextBilledAt: { type: 'string' },
            trialDates: { type: 'hash' },
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
    customData: { type: 'hash' },
    importMeta: { type: 'hash' },
    nextTransaction: {
      type: {
        type: 'hash',
        fields: {
          billingPeriod: {
            type: {
              type: 'hash',
              fields: {
                startsAt: { type: 'string' },
                endsAt: { type: 'string' },
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
                lineItems: {
                  type: {
                    type: 'list',
                    element_type: {
                      type: 'hash',
                      fields: {
                        priceId: { type: 'string' },
                        quantity: { type: 'integer' },
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
                        proration: { type: 'hash' },
                      },
                    },
                  },
                },
              },
            },
          },
          adjustments: { type: { type: 'list', element_type: 'hash' } },
        },
      },
    },
    recurringTransactionDetails: {
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
          lineItems: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  priceId: { type: 'string' },
                  quantity: { type: 'integer' },
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
                  proration: { type: 'hash' },
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;
