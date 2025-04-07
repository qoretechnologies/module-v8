import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const ShopifyFindProductResponseType = {
  type: 'hash',
  fields: {
    products: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: {
              type: 'string',
              desc: 'A globally-unique ID',
            },
            title: {
              type: 'string',
              desc: 'The product title',
            },
            handle: {
              type: 'string',
              desc: 'The product handle (URL-friendly version of the title)',
            },
            description: {
              type: 'string',
              desc: 'The product description',
            },
            descriptionHtml: {
              type: 'string',
              desc: 'The product description in HTML format',
            },
            productType: {
              type: 'string',
              desc: 'The product type',
            },
            vendor: {
              type: 'string',
              desc: 'The product vendor',
            },
            tags: {
              type: {
                type: 'list',
                desc: 'A list of tags that have been added to the product',
                element_type: {
                  type: 'string',
                },
              },
            },
            status: {
              type: 'string',
              desc: 'The product status (ACTIVE, ARCHIVED, DRAFT)',
            },
            isGiftCard: {
              type: 'boolean',
              desc: 'Whether the product is a gift card',
            },
            requiresSellingPlan: {
              type: 'boolean',
              desc: 'Whether the product can only be purchased with a selling plan',
            },
            tracksInventory: {
              type: 'boolean',
              desc: 'Whether inventory tracking has been enabled for the product',
            },
            hasOnlyDefaultVariant: {
              type: 'boolean',
              desc: 'Whether the product has only a single variant with the default option and value',
            },
            hasOutOfStockVariants: {
              type: 'boolean',
              desc: 'Whether the product has variants that are out of stock',
            },
            createdAt: {
              type: 'string',
              desc: 'The date and time when the product was created',
            },
            updatedAt: {
              type: 'string',
              desc: 'The date and time when the product was last updated',
            },
            publishedAt: {
              type: 'string',
              desc: 'The date and time when the product was published to the online store',
            },
            onlineStoreUrl: {
              type: 'string',
              desc: 'The URL of the product in the online store',
            },
            onlineStorePreviewUrl: {
              type: 'string',
              desc: 'The preview URL for the online store',
            },
            templateSuffix: {
              type: 'string',
              desc: "The theme template that's used when customers view the product in a store",
            },
            legacyResourceId: {
              type: 'string',
              desc: 'The ID of the corresponding resource in the REST Admin API',
            },
            featuredMedia: {
              type: {
                type: 'hash',
                desc: 'The featured media of the product',
                fields: {
                  id: {
                    type: 'string',
                  },
                  image: {
                    type: {
                      type: 'hash',
                      fields: {
                        url: {
                          type: 'string',
                        },
                        altText: {
                          type: 'string',
                        },
                        width: {
                          type: 'int',
                        },
                        height: {
                          type: 'int',
                        },
                      },
                    },
                  },
                },
              },
            },
            priceRangeV2: {
              type: {
                type: 'hash',
                desc: 'The price range of the product',
                fields: {
                  minVariantPrice: {
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
                  maxVariantPrice: {
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
            totalInventory: {
              type: 'int',
              desc: 'The total inventory across all variants',
            },
            seo: {
              type: {
                type: 'hash',
                desc: 'The SEO information for the product',
                fields: {
                  title: {
                    type: 'string',
                  },
                  description: {
                    type: 'string',
                  },
                },
              },
            },
            options: {
              type: {
                type: 'list',
                desc: 'The product options (such as size, color, etc.)',
                element_type: {
                  type: 'hash',
                  fields: {
                    id: {
                      type: 'string',
                    },
                    name: {
                      type: 'string',
                    },
                    values: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'string',
                        },
                      },
                    },
                    position: {
                      type: 'int',
                    },
                  },
                },
              },
            },
            media: {
              type: {
                type: 'list',
                desc: 'The media of the product',
                element_type: {
                  type: 'hash',
                  fields: {
                    id: {
                      type: 'string',
                    },
                    image: {
                      type: {
                        type: 'hash',
                        fields: {
                          url: {
                            type: 'string',
                          },
                          altText: {
                            type: 'string',
                          },
                          width: {
                            type: 'int',
                          },
                          height: {
                            type: 'int',
                          },
                        },
                      },
                    },
                    sources: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            url: {
                              type: 'string',
                            },
                            mimeType: {
                              type: 'string',
                            },
                            format: {
                              type: 'string',
                            },
                            height: {
                              type: 'int',
                            },
                            width: {
                              type: 'int',
                            },
                          },
                        },
                      },
                    },
                    originalSource: {
                      type: {
                        type: 'hash',
                        fields: {
                          url: {
                            type: 'string',
                          },
                          mimeType: {
                            type: 'string',
                          },
                          format: {
                            type: 'string',
                          },
                          height: {
                            type: 'int',
                          },
                          width: {
                            type: 'int',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            metafields: {
              type: {
                type: 'list',
                desc: 'Custom fields associated with the product',
                element_type: {
                  type: 'hash',
                  fields: {
                    namespace: {
                      type: 'string',
                    },
                    key: {
                      type: 'string',
                    },
                    value: {
                      type: 'string',
                    },
                    type: {
                      type: 'string',
                    },
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
            type: 'boolean',
          },
          endCursor: {
            type: 'string',
          },
        },
      },
    },
  },
} as const satisfies TQoreResponseType;
