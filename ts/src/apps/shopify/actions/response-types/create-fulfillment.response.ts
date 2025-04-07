import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const ShopifyCreateFulfillmentResponseType = {
  type: 'hash',
  fields: {
    fulfillment: {
      type: {
        type: 'hash',
        fields: {
          id: {
            type: 'string',
            required: true,
            desc: 'The ID of the created fulfillment',
          },
          status: {
            type: 'string',
            required: false,
            desc: 'The status of the fulfillment',
          },
          createdAt: {
            type: 'date',
            required: false,
            desc: 'The date and time when the fulfillment was created',
          },
          updatedAt: {
            type: 'date',
            required: false,
            desc: 'The date and time when the fulfillment was last updated',
          },
          estimatedDeliveryAt: {
            type: 'date',
            required: false,
            desc: 'The estimated delivery time of the fulfillment',
          },
          deliveredAt: {
            type: 'date',
            required: false,
            desc: 'The delivery time of the fulfillment',
          },
          displayStatus: {
            type: 'string',
            required: false,
            desc: 'Human-readable display status of the fulfillment',
          },
          fulfillmentLineItems: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  id: {
                    type: 'string',
                    required: true,
                    desc: 'The ID of the fulfillment line item',
                  },
                  lineItem: {
                    type: {
                      type: 'hash',
                      fields: {
                        id: {
                          type: 'string',
                          required: true,
                          desc: 'The ID of the order line item',
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
                      },
                    },
                    required: false,
                    desc: 'The order line item associated with this fulfillment line item',
                  },
                  quantity: {
                    type: 'int',
                    required: false,
                    desc: 'The quantity of the line item in this fulfillment',
                  },
                  originalTotalSet: {
                    type: {
                      type: 'hash',
                      fields: {
                        shopMoney: {
                          type: {
                            type: 'hash',
                            fields: {
                              amount: {
                                type: 'string',
                                required: false,
                                desc: 'The amount of the money',
                              },
                              currencyCode: {
                                type: 'string',
                                required: false,
                                desc: 'The currency code of the money',
                              },
                            },
                          },
                          required: false,
                          desc: 'The shop money presentation of the original total',
                        },
                        presentmentMoney: {
                          type: {
                            type: 'hash',
                            fields: {
                              amount: {
                                type: 'string',
                                required: false,
                                desc: 'The amount of the money',
                              },
                              currencyCode: {
                                type: 'string',
                                required: false,
                                desc: 'The currency code of the money',
                              },
                            },
                          },
                          required: false,
                          desc: 'The presentment money presentation of the original total',
                        },
                      },
                    },
                    required: false,
                    desc: 'The original total price of the line items',
                  },
                },
              },
            },
            required: false,
            desc: 'Line items included in the fulfillment',
          },
          location: {
            type: {
              type: 'hash',
              fields: {
                id: {
                  type: 'string',
                  required: true,
                  desc: 'The ID of the location',
                },
                name: {
                  type: 'string',
                  required: false,
                  desc: 'The name of the location',
                },
                address: {
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
                      provinceCode: {
                        type: 'string',
                        required: false,
                        desc: 'The province code of the address',
                      },
                      countryCode: {
                        type: 'string',
                        required: false,
                        desc: 'The country code of the address',
                      },
                      zip: {
                        type: 'string',
                        required: false,
                        desc: 'The ZIP code of the address',
                      },
                    },
                  },
                  required: false,
                  desc: 'The address of the location',
                },
              },
            },
            required: false,
            desc: 'The location from which the fulfillment was processed',
          },
          service: {
            type: {
              type: 'hash',
              fields: {
                handle: {
                  type: 'string',
                  required: false,
                  desc: 'The handle of the fulfillment service',
                },
              },
            },
            required: false,
            desc: 'The service provider that fulfilled the order',
          },
          trackingInfo: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  company: {
                    type: 'string',
                    required: false,
                    desc: 'The name of the tracking company',
                  },
                  number: {
                    type: 'string',
                    required: false,
                    desc: 'The tracking number',
                  },
                  url: {
                    type: 'string',
                    required: false,
                    desc: 'The URL to track the fulfillment',
                  },
                },
              },
            },
            required: false,
            desc: 'The tracking information associated with the fulfillment',
          },
          originAddress: {
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
                countryCode: {
                  type: 'string',
                  required: false,
                  desc: 'The country code of the address',
                },
                provinceCode: {
                  type: 'string',
                  required: false,
                  desc: 'The province code of the address',
                },
                zip: {
                  type: 'string',
                  required: false,
                  desc: 'The ZIP code of the address',
                },
              },
            },
            required: false,
            desc: 'The address from which the fulfillment originated',
          },
        },
      },
      required: true,
      desc: 'The created fulfillment',
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
