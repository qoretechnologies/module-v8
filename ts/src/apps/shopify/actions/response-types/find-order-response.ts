import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const ShopifyFindOrderResponseType = {
  type: 'hash',
  fields: {
    orders: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: {
              type: 'string',
              desc: 'A globally-unique ID',
            },
            name: {
              type: 'string',
              desc: 'The order name, typically a number prefixed with #',
            },
            email: {
              type: 'string',
              desc: "The customer's email address",
            },
            phone: {
              type: 'string',
              desc: "The customer's phone number",
            },
            processedAt: {
              type: 'string',
              desc: 'The date and time when the order was processed',
            },
            createdAt: {
              type: 'string',
              desc: 'The date and time when the order was created',
            },
            updatedAt: {
              type: 'string',
              desc: 'The date and time when the order was last updated',
            },
            cancelledAt: {
              type: 'string',
              desc: 'The date and time when the order was cancelled',
            },
            cancelReason: {
              type: 'string',
              desc: 'The reason for the order cancellation',
            },
            displayFinancialStatus: {
              type: 'string',
              desc: 'The order financial status for display purposes',
            },
            displayFulfillmentStatus: {
              type: 'string',
              desc: 'The order fulfillment status for display purposes',
            },
            confirmed: {
              type: 'bool',
              desc: 'Whether the order has been confirmed',
            },
            fulfillable: {
              type: 'bool',
              desc: 'Whether the order can be fulfilled',
            },
            note: {
              type: 'string',
              desc: 'A note about the order',
            },
            tags: {
              type: {
                type: 'list',
                desc: 'A list of tags that have been added to the order',
                element_type: {
                  type: 'string',
                },
              },
            },
            totalPriceSet: {
              type: {
                type: 'hash',
                desc: 'The total price of the order',
                fields: {
                  shopMoney: {
                    type: {
                      type: 'hash',
                      fields: {
                        amount: {
                          type: 'string',
                        },
                        currencyCode: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
            subtotalPriceSet: {
              type: {
                type: 'hash',
                desc: 'The subtotal price of the order',
                fields: {
                  shopMoney: {
                    type: {
                      type: 'hash',
                      fields: {
                        amount: {
                          type: 'string',
                        },
                        currencyCode: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
            totalShippingPriceSet: {
              type: {
                type: 'hash',
                desc: 'The total shipping price of the order',
                fields: {
                  shopMoney: {
                    type: {
                      type: 'hash',
                      fields: {
                        amount: {
                          type: 'string',
                        },
                        currencyCode: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
            totalTaxSet: {
              type: {
                type: 'hash',
                desc: 'The total tax of the order',
                fields: {
                  shopMoney: {
                    type: {
                      type: 'hash',
                      fields: {
                        amount: {
                          type: 'string',
                        },
                        currencyCode: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
            currencyCode: {
              type: 'string',
              desc: 'The currency code of the order',
            },
            customer: {
              type: {
                type: 'hash',
                desc: 'The customer associated with the order',
                fields: {
                  id: {
                    type: 'string',
                  },
                  firstName: {
                    type: 'string',
                  },
                  lastName: {
                    type: 'string',
                  },
                  displayName: {
                    type: 'string',
                  },
                  email: {
                    type: 'string',
                  },
                },
              },
            },
            shippingAddress: {
              type: {
                type: 'hash',
                desc: 'The shipping address for the order',
                fields: {
                  id: {
                    type: 'string',
                  },
                  address1: {
                    type: 'string',
                  },
                  address2: {
                    type: 'string',
                  },
                  city: {
                    type: 'string',
                  },
                  company: {
                    type: 'string',
                  },
                  country: {
                    type: 'string',
                  },
                  countryCode: {
                    type: 'string',
                  },
                  firstName: {
                    type: 'string',
                  },
                  lastName: {
                    type: 'string',
                  },
                  phone: {
                    type: 'string',
                  },
                  province: {
                    type: 'string',
                  },
                  provinceCode: {
                    type: 'string',
                  },
                  zip: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
    pageInfo: {
      type: {
        type: 'hash',
        fields: {
          hasNextPage: {
            type: 'bool',
          },
          endCursor: {
            type: 'string',
          },
        },
      },
    },
  },
} as const satisfies TQoreResponseType;
