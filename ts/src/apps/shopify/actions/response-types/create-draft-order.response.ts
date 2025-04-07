import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const ShopifyCreateDraftOrderResponseType = {
  type: 'hash',
  fields: {
    draftOrder: {
      type: {
        type: 'hash',
        fields: {
          id: {
            type: 'string',
            required: true,
            desc: 'The ID of the created draft order',
          },
          name: {
            type: 'string',
            required: false,
            desc: 'The name of the draft order (e.g. #D1)',
          },
          email: {
            type: 'string',
            required: false,
            desc: 'The customer email',
          },
          phone: {
            type: 'string',
            required: false,
            desc: 'The customer phone',
          },
          taxExempt: {
            type: 'bool',
            required: false,
            desc: 'Whether the draft order is tax exempt',
          },
          tags: {
            type: {
              type: 'list',
              element_type: 'string',
            },
            required: false,
            desc: 'Tags associated with the draft order',
          },
          subtotalPrice: {
            type: 'string',
            required: false,
            desc: 'The subtotal price of the draft order',
          },
          totalPrice: {
            type: 'string',
            required: false,
            desc: 'The total price of the draft order',
          },
          totalTax: {
            type: 'string',
            required: false,
            desc: 'The total tax of the draft order',
          },
          status: {
            type: 'string',
            required: false,
            desc: 'The status of the draft order',
          },
          createdAt: {
            type: 'date',
            required: false,
            desc: 'The date and time when the draft order was created',
          },
          updatedAt: {
            type: 'date',
            required: false,
            desc: 'The date and time when the draft order was last updated',
          },
          invoiceUrl: {
            type: 'string',
            required: false,
            desc: 'The URL for the invoice of the draft order',
          },
          customer: {
            type: {
              type: 'hash',
              fields: {
                id: {
                  type: 'string',
                  required: false,
                  desc: 'The ID of the customer',
                },
                firstName: {
                  type: 'string',
                  required: false,
                  desc: 'The first name of the customer',
                },
                lastName: {
                  type: 'string',
                  required: false,
                  desc: 'The last name of the customer',
                },
                email: {
                  type: 'string',
                  required: false,
                  desc: 'The email of the customer',
                },
              },
            },
            required: false,
            desc: 'The customer associated with the draft order',
          },
          lineItems: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  id: {
                    type: 'string',
                    required: true,
                    desc: 'The ID of the line item',
                  },
                  title: {
                    type: 'string',
                    required: false,
                    desc: 'The title of the line item',
                  },
                  quantity: {
                    type: 'int',
                    required: false,
                    desc: 'The quantity of the line item',
                  },
                  originalUnitPrice: {
                    type: 'string',
                    required: false,
                    desc: 'The original unit price of the line item',
                  },
                  variantTitle: {
                    type: 'string',
                    required: false,
                    desc: 'The title of the variant',
                  },
                  vendor: {
                    type: 'string',
                    required: false,
                    desc: 'The vendor of the line item',
                  },
                  sku: {
                    type: 'string',
                    required: false,
                    desc: 'The SKU of the line item',
                  },
                  requiresShipping: {
                    type: 'bool',
                    required: false,
                    desc: 'Whether the line item requires shipping',
                  },
                  taxable: {
                    type: 'bool',
                    required: false,
                    desc: 'Whether the line item is taxable',
                  },
                  product: {
                    type: {
                      type: 'hash',
                      fields: {
                        id: {
                          type: 'string',
                          required: true,
                          desc: 'The ID of the product',
                        },
                        title: {
                          type: 'string',
                          required: false,
                          desc: 'The title of the product',
                        },
                      },
                    },
                    required: false,
                    desc: 'The product associated with the line item',
                  },
                  variant: {
                    type: {
                      type: 'hash',
                      fields: {
                        id: {
                          type: 'string',
                          required: true,
                          desc: 'The ID of the variant',
                        },
                        title: {
                          type: 'string',
                          required: false,
                          desc: 'The title of the variant',
                        },
                        sku: {
                          type: 'string',
                          required: false,
                          desc: 'The SKU of the variant',
                        },
                        price: {
                          type: 'string',
                          required: false,
                          desc: 'The price of the variant',
                        },
                      },
                    },
                    required: false,
                    desc: 'The variant associated with the line item',
                  },
                  appliedDiscount: {
                    type: {
                      type: 'hash',
                      fields: {
                        title: {
                          type: 'string',
                          required: false,
                          desc: 'The title of the discount',
                        },
                        description: {
                          type: 'string',
                          required: false,
                          desc: 'The description of the discount',
                        },
                        value: {
                          type: 'float',
                          required: false,
                          desc: 'The value of the discount',
                        },
                        valueType: {
                          type: 'string',
                          required: false,
                          desc: 'The type of the discount (PERCENTAGE or FIXED_AMOUNT)',
                        },
                      },
                    },
                    required: false,
                    desc: 'The discount applied to the line item',
                  },
                  customAttributes: {
                    type: {
                      type: 'list',
                      element_type: {
                        type: 'hash',
                        fields: {
                          key: {
                            type: 'string',
                            required: true,
                            desc: 'The key of the attribute',
                          },
                          value: {
                            type: 'string',
                            required: true,
                            desc: 'The value of the attribute',
                          },
                        },
                      },
                    },
                    required: false,
                    desc: 'Custom attributes of the line item',
                  },
                },
              },
            },
            required: false,
            desc: 'Line items in the draft order',
          },
          shippingLine: {
            type: {
              type: 'hash',
              fields: {
                title: {
                  type: 'string',
                  required: false,
                  desc: 'The title of the shipping line',
                },
                price: {
                  type: 'string',
                  required: false,
                  desc: 'The price of the shipping line',
                },
                shippingRateHandle: {
                  type: 'string',
                  required: false,
                  desc: 'A unique identifier for the shipping rate',
                },
              },
            },
            required: false,
            desc: 'The shipping line for the draft order',
          },
          shippingAddress: {
            type: {
              type: 'hash',
              fields: {
                address1: {
                  type: 'string',
                  required: false,
                  desc: 'The first line of the address',
                },
                address2: {
                  type: 'string',
                  required: false,
                  desc: 'The second line of the address',
                },
                city: {
                  type: 'string',
                  required: false,
                  desc: 'The city of the address',
                },
                province: {
                  type: 'string',
                  required: false,
                  desc: 'The province or state of the address',
                },
                country: {
                  type: 'string',
                  required: false,
                  desc: 'The country of the address',
                },
                zip: {
                  type: 'string',
                  required: false,
                  desc: 'The zip or postal code of the address',
                },
                firstName: {
                  type: 'string',
                  required: false,
                  desc: 'The first name of the recipient',
                },
                lastName: {
                  type: 'string',
                  required: false,
                  desc: 'The last name of the recipient',
                },
                company: {
                  type: 'string',
                  required: false,
                  desc: 'The company of the recipient',
                },
                phone: {
                  type: 'string',
                  required: false,
                  desc: 'The phone number of the recipient',
                },
              },
            },
            required: false,
            desc: 'The shipping address for the draft order',
          },
          billingAddress: {
            type: {
              type: 'hash',
              fields: {
                address1: {
                  type: 'string',
                  required: false,
                  desc: 'The first line of the address',
                },
                address2: {
                  type: 'string',
                  required: false,
                  desc: 'The second line of the address',
                },
                city: {
                  type: 'string',
                  required: false,
                  desc: 'The city of the address',
                },
                province: {
                  type: 'string',
                  required: false,
                  desc: 'The province or state of the address',
                },
                country: {
                  type: 'string',
                  required: false,
                  desc: 'The country of the address',
                },
                zip: {
                  type: 'string',
                  required: false,
                  desc: 'The zip or postal code of the address',
                },
                firstName: {
                  type: 'string',
                  required: false,
                  desc: 'The first name of the recipient',
                },
                lastName: {
                  type: 'string',
                  required: false,
                  desc: 'The last name of the recipient',
                },
                company: {
                  type: 'string',
                  required: false,
                  desc: 'The company of the recipient',
                },
                phone: {
                  type: 'string',
                  required: false,
                  desc: 'The phone number of the recipient',
                },
              },
            },
            required: false,
            desc: 'The billing address for the draft order',
          },
          appliedDiscount: {
            type: {
              type: 'hash',
              fields: {
                title: {
                  type: 'string',
                  required: false,
                  desc: 'The title of the discount',
                },
                description: {
                  type: 'string',
                  required: false,
                  desc: 'The description of the discount',
                },
                value: {
                  type: 'float',
                  required: false,
                  desc: 'The value of the discount',
                },
                valueType: {
                  type: 'string',
                  required: false,
                  desc: 'The type of the discount (PERCENTAGE or FIXED_AMOUNT)',
                },
              },
            },
            required: false,
            desc: 'The discount applied to the draft order',
          },
          customAttributes: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  key: {
                    type: 'string',
                    required: true,
                    desc: 'The key of the attribute',
                  },
                  value: {
                    type: 'string',
                    required: true,
                    desc: 'The value of the attribute',
                  },
                },
              },
            },
            required: false,
            desc: 'Custom attributes of the draft order',
          },
          metafields: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  id: {
                    type: 'string',
                    required: true,
                    desc: 'The ID of the metafield',
                  },
                  namespace: {
                    type: 'string',
                    required: true,
                    desc: 'The namespace of the metafield',
                  },
                  key: {
                    type: 'string',
                    required: true,
                    desc: 'The key of the metafield',
                  },
                  value: {
                    type: 'string',
                    required: true,
                    desc: 'The value of the metafield',
                  },
                  type: {
                    type: 'string',
                    required: true,
                    desc: 'The type of the metafield',
                  },
                },
              },
            },
            required: false,
            desc: 'Metafields associated with the draft order',
          },
        },
      },
      required: true,
      desc: 'The created draft order',
    },
    userErrors: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            field: {
              type: 'string',
              required: false,
              desc: 'The field that caused the error',
            },
            message: {
              type: 'string',
              required: true,
              desc: 'The error message',
            },
          },
        },
      },
      required: false,
      desc: 'Errors that occurred during the operation',
    },
  },
} as const satisfies TQoreResponseType;
