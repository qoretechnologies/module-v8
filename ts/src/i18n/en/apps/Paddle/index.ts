/* eslint-disable max-len */
const PaddleAppEn = {
  displayName: 'Paddle',
  shortDesc: 'Payment processing and subscription management platform',
  longDesc:
    'Integrate with Paddle to handle payments, subscriptions, and billing. Supports one-time payments, recurring subscriptions, tax calculations, and customer management across multiple currencies and regions.',
  actions: {
    archive_product: {
      displayName: 'Archive Product',
      shortDesc: 'Archive a product in Paddle',
      longDesc:
        'Archives an existing product in Paddle, making it unavailable for new purchases while preserving historical data.',
      options: {
        product_id: {
          displayName: 'Product ID',
          shortDesc: 'The product to archive',
          longDesc: 'The unique identifier of the product to archive.',
        },
      },
    },

    create_product: {
      displayName: 'Create Product',
      shortDesc: 'Create a new product in Paddle',
      longDesc:
        'Creates a new product in Paddle with specified details including name, tax category, description, and other optional properties.',
      options: {
        name: {
          displayName: 'Name',
          shortDesc: 'Product name',
          longDesc: 'The name of the product.',
        },
        tax_category: {
          displayName: 'Tax Category',
          shortDesc: 'Tax category for the product',
          longDesc: 'The tax category that applies to this product for tax calculation purposes.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Product description',
          longDesc: 'A detailed description of the product.',
        },
        type: {
          displayName: 'Type',
          shortDesc: 'Product type',
          longDesc: 'The type of product (e.g., standard, digital).',
        },
        image_url: {
          displayName: 'Image URL',
          shortDesc: 'Product image URL',
          longDesc: 'URL to an image representing the product.',
        },
        custom_data: {
          displayName: 'Custom Data',
          shortDesc: 'Custom metadata',
          longDesc: 'Custom metadata to store with the product as key-value pairs.',
        },
      },
    },

    get_product: {
      displayName: 'Get Product',
      shortDesc: 'Retrieve a product from Paddle',
      longDesc:
        'Retrieves detailed information about a specific product from Paddle, with optional inclusion of pricing information.',
      options: {
        product_id: {
          displayName: 'Product ID',
          shortDesc: 'The product to retrieve',
          longDesc: 'The unique identifier of the product to retrieve.',
        },
        include_prices: {
          displayName: 'Include Prices',
          shortDesc: 'Include pricing information',
          longDesc: 'Whether to include pricing information in the response.',
        },
      },
    },

    list_products: {
      displayName: 'List Products',
      shortDesc: 'List products from Paddle',
      longDesc:
        'Retrieves a list of products from Paddle with support for filtering, pagination, and sorting options.',
      options: {
        include_prices: {
          displayName: 'Include Prices',
          shortDesc: 'Include pricing information',
          longDesc: 'Whether to include pricing information for each product in the response.',
        },
        after: {
          displayName: 'After',
          shortDesc: 'Pagination cursor',
          longDesc: 'A cursor for pagination. Use this to get the next page of results.',
        },
        ids: {
          displayName: 'Product IDs',
          shortDesc: 'Filter by specific product IDs',
          longDesc:
            'A list of specific product IDs to retrieve. If provided, only these products will be returned.',
        },
        per_page: {
          displayName: 'Per Page',
          shortDesc: 'Number of results per page',
          longDesc: 'The number of products to return per page. Maximum is 200.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Filter by product status',
          longDesc: 'Filter products by their status (e.g., active, archived).',
        },
        type: {
          displayName: 'Type',
          shortDesc: 'Filter by product type',
          longDesc: 'Filter products by their type (e.g., standard, digital).',
        },
        tax_category: {
          displayName: 'Tax Categories',
          shortDesc: 'Filter by tax categories',
          longDesc: 'Filter products by one or more tax categories.',
        },
        order: {
          displayName: 'Sort Order',
          shortDesc: 'Sorting configuration',
          longDesc: 'Configure how to sort the results.',
          fields: {
            field: {
              displayName: 'Sort Field',
              shortDesc: 'Field to sort by',
              longDesc: 'The field to sort the results by.',
            },
            direction: {
              displayName: 'Sort Direction',
              shortDesc: 'Sort direction',
              longDesc: 'The direction to sort the results (ascending or descending).',
            },
          },
        },
      },
    },

    update_product: {
      displayName: 'Update Product',
      shortDesc: 'Update a product in Paddle',
      longDesc:
        'Updates an existing product in Paddle with new information such as name, description, status, or other properties.',
      options: {
        product_id: {
          displayName: 'Product ID',
          shortDesc: 'The product to update',
          longDesc: 'The unique identifier of the product to update.',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Product name',
          longDesc: 'The updated name of the product.',
        },
        tax_category: {
          displayName: 'Tax Category',
          shortDesc: 'Tax category for the product',
          longDesc:
            'The updated tax category that applies to this product for tax calculation purposes.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Product description',
          longDesc: 'The updated description of the product.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Product status',
          longDesc: 'The updated status of the product (e.g., active, archived).',
        },
        type: {
          displayName: 'Type',
          shortDesc: 'Product type',
          longDesc: 'The updated type of product (e.g., standard, digital).',
        },
        image_url: {
          displayName: 'Image URL',
          shortDesc: 'Product image URL',
          longDesc: 'Updated URL to an image representing the product.',
        },
        custom_data: {
          displayName: 'Custom Data',
          shortDesc: 'Custom metadata',
          longDesc: 'Updated custom metadata to store with the product as key-value pairs.',
        },
      },
    },

    create_price: {
      displayName: 'Create Price',
      shortDesc: 'Create a new price for a product in Paddle',
      longDesc:
        'Creates a new price for an existing product in Paddle with specified unit price, billing cycle, tax mode, and other pricing configurations.',
      options: {
        product_id: {
          displayName: 'Product ID',
          shortDesc: 'The product to create a price for',
          longDesc: 'The unique identifier of the product to create a price for.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Price description',
          longDesc: 'A detailed description of this price option.',
        },
        unit_price: {
          displayName: 'Unit Price',
          shortDesc: 'Base unit price',
          longDesc: 'The base unit price for this pricing option.',
          fields: {
            amount: {
              displayName: 'Amount',
              shortDesc: 'Price amount',
              longDesc: 'The price amount as a string (e.g., "9.99").',
            },
            currencyCode: {
              displayName: 'Currency Code',
              shortDesc: 'Currency for the price',
              longDesc: 'The three-letter ISO currency code (e.g., USD, EUR, GBP).',
            },
          },
        },
        type: {
          displayName: 'Type',
          shortDesc: 'Price type',
          longDesc: 'The type of pricing (e.g., standard, digital).',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Price name',
          longDesc: 'A friendly name for this pricing option.',
        },
        billing_cycle: {
          displayName: 'Billing Cycle',
          shortDesc: 'Billing frequency and interval',
          longDesc: 'Defines how often the customer is billed for recurring prices.',
          fields: {
            frequency: {
              displayName: 'Frequency',
              shortDesc: 'Billing frequency number',
              longDesc:
                'How many intervals between each billing (e.g., 1 for every month, 2 for every 2 months).',
            },
            interval: {
              displayName: 'Interval',
              shortDesc: 'Billing interval unit',
              longDesc: 'The time unit for billing (e.g., day, week, month, year).',
            },
          },
        },
        trial_period: {
          displayName: 'Trial Period',
          shortDesc: 'Free trial configuration',
          longDesc: 'Defines the length of the free trial period for this price.',
          fields: {
            frequency: {
              displayName: 'Trial Frequency',
              shortDesc: 'Trial period length',
              longDesc: 'The number of intervals for the trial period.',
            },
            interval: {
              displayName: 'Trial Interval',
              shortDesc: 'Trial period unit',
              longDesc: 'The time unit for the trial period (e.g., day, week, month).',
            },
          },
        },
        tax_mode: {
          displayName: 'Tax Mode',
          shortDesc: 'How tax is calculated',
          longDesc: 'Determines whether the price includes tax or if tax is added on top.',
        },
        unit_price_overrides: {
          displayName: 'Price Overrides',
          shortDesc: 'Country-specific pricing',
          longDesc: 'Override the base price for specific countries or regions.',
          fields: {
            countryCodes: {
              displayName: 'Country Codes',
              shortDesc: 'Countries for this override',
              longDesc: 'List of ISO country codes where this price override applies.',
            },
            unitPrice: {
              displayName: 'Override Price',
              shortDesc: 'Price for these countries',
              longDesc: 'The specific price to use for the selected countries.',
              fields: {
                amount: {
                  displayName: 'Override Amount',
                  shortDesc: 'Override price amount',
                  longDesc: 'The override price amount as a string.',
                },
                currencyCode: {
                  displayName: 'Override Currency',
                  shortDesc: 'Currency for override price',
                  longDesc: 'The currency code for the override price.',
                },
              },
            },
          },
        },
        quantity: {
          displayName: 'Quantity Limits',
          shortDesc: 'Minimum and maximum quantity',
          longDesc: 'Set limits on how many units can be purchased.',
          fields: {
            minimum: {
              displayName: 'Minimum Quantity',
              shortDesc: 'Minimum purchase quantity',
              longDesc: 'The minimum number of units that must be purchased.',
            },
            maximum: {
              displayName: 'Maximum Quantity',
              shortDesc: 'Maximum purchase quantity',
              longDesc: 'The maximum number of units that can be purchased.',
            },
          },
        },
        custom_data: {
          displayName: 'Custom Data',
          shortDesc: 'Custom metadata',
          longDesc: 'Custom metadata to store with the price as key-value pairs.',
        },
      },
    },

    get_price: {
      displayName: 'Get Price',
      shortDesc: 'Retrieve a price from Paddle',
      longDesc:
        'Retrieves detailed information about a specific price from Paddle, with optional inclusion of product information.',
      options: {
        price_id: {
          displayName: 'Price ID',
          shortDesc: 'The price to retrieve',
          longDesc: 'The unique identifier of the price to retrieve.',
        },
        include_product: {
          displayName: 'Include Product',
          shortDesc: 'Include product information',
          longDesc: 'Whether to include the associated product information in the response.',
        },
      },
    },

    list_prices: {
      displayName: 'List Prices',
      shortDesc: 'List prices from Paddle',
      longDesc:
        'Retrieves a list of prices from Paddle with support for filtering by product, status, type, and other criteria, plus sorting and pagination options.',
      options: {
        include_product: {
          displayName: 'Include Product',
          shortDesc: 'Include product information',
          longDesc:
            'Whether to include the associated product information for each price in the response.',
        },
        after: {
          displayName: 'After',
          shortDesc: 'Pagination cursor',
          longDesc: 'A cursor for pagination. Use this to get the next page of results.',
        },
        ids: {
          displayName: 'Price IDs',
          shortDesc: 'Filter by specific price IDs',
          longDesc:
            'A list of specific price IDs to retrieve. If provided, only these prices will be returned.',
        },
        product_ids: {
          displayName: 'Product IDs',
          shortDesc: 'Filter by product IDs',
          longDesc:
            'A list of product IDs to filter prices by. Only prices for these products will be returned.',
        },
        per_page: {
          displayName: 'Per Page',
          shortDesc: 'Number of results per page',
          longDesc: 'The number of prices to return per page. Maximum is 200.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Filter by price status',
          longDesc: 'Filter prices by their status (e.g., active, archived).',
        },
        recurring: {
          displayName: 'Recurring Only',
          shortDesc: 'Filter by recurring prices',
          longDesc: 'Whether to only return recurring prices (with billing cycles).',
        },
        type: {
          displayName: 'Type',
          shortDesc: 'Filter by price type',
          longDesc: 'Filter prices by their type (e.g., standard, digital).',
        },
        order: {
          displayName: 'Sort Order',
          shortDesc: 'Sorting configuration',
          longDesc: 'Configure how to sort the results.',
          fields: {
            field: {
              displayName: 'Sort Field',
              shortDesc: 'Field to sort by',
              longDesc: 'The field to sort the results by.',
            },
            direction: {
              displayName: 'Sort Direction',
              shortDesc: 'Sort direction',
              longDesc: 'The direction to sort the results (ascending or descending).',
            },
          },
        },
      },
    },

    update_price: {
      displayName: 'Update Price',
      shortDesc: 'Update a price in Paddle',
      longDesc:
        'Updates an existing price in Paddle with new pricing information, billing cycles, tax settings, or other price configurations.',
      options: {
        price_id: {
          displayName: 'Price ID',
          shortDesc: 'The price to update',
          longDesc: 'The unique identifier of the price to update.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Updated price description',
          longDesc: 'An updated description for this price option.',
        },
        unit_price: {
          displayName: 'Unit Price',
          shortDesc: 'Updated unit price',
          longDesc: 'The updated base unit price for this pricing option.',
          fields: {
            amount: {
              displayName: 'Amount',
              shortDesc: 'Updated price amount',
              longDesc: 'The updated price amount as a string (e.g., "9.99").',
            },
            currencyCode: {
              displayName: 'Currency Code',
              shortDesc: 'Updated currency for the price',
              longDesc: 'The updated three-letter ISO currency code (e.g., USD, EUR, GBP).',
            },
          },
        },
        type: {
          displayName: 'Type',
          shortDesc: 'Updated price type',
          longDesc: 'The updated type of pricing (e.g., standard, digital).',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Updated price name',
          longDesc: 'An updated friendly name for this pricing option.',
        },
        billing_cycle: {
          displayName: 'Billing Cycle',
          shortDesc: 'Updated billing frequency',
          longDesc:
            'Updated configuration for how often the customer is billed for recurring prices.',
          fields: {
            frequency: {
              displayName: 'Frequency',
              shortDesc: 'Updated billing frequency',
              longDesc: 'Updated number of intervals between each billing.',
            },
            interval: {
              displayName: 'Interval',
              shortDesc: 'Updated billing interval',
              longDesc: 'The updated time unit for billing (e.g., day, week, month, year).',
            },
          },
        },
        trial_period: {
          displayName: 'Trial Period',
          shortDesc: 'Updated trial configuration',
          longDesc: 'Updated configuration for the free trial period for this price.',
          fields: {
            frequency: {
              displayName: 'Trial Frequency',
              shortDesc: 'Updated trial period length',
              longDesc: 'The updated number of intervals for the trial period.',
            },
            interval: {
              displayName: 'Trial Interval',
              shortDesc: 'Updated trial period unit',
              longDesc: 'The updated time unit for the trial period (e.g., day, week, month).',
            },
          },
        },
        tax_mode: {
          displayName: 'Tax Mode',
          shortDesc: 'Updated tax calculation method',
          longDesc: 'Updated setting for whether the price includes tax or if tax is added on top.',
        },
        unit_price_overrides: {
          displayName: 'Price Overrides',
          shortDesc: 'Updated country-specific pricing',
          longDesc: 'Updated price overrides for specific countries or regions.',
          fields: {
            countryCodes: {
              displayName: 'Country Codes',
              shortDesc: 'Updated countries for overrides',
              longDesc: 'Updated list of ISO country codes where price overrides apply.',
            },
            unitPrice: {
              displayName: 'Override Price',
              shortDesc: 'Updated override price',
              longDesc: 'The updated specific price to use for the selected countries.',
              fields: {
                amount: {
                  displayName: 'Override Amount',
                  shortDesc: 'Updated override amount',
                  longDesc: 'The updated override price amount as a string.',
                },
                currencyCode: {
                  displayName: 'Override Currency',
                  shortDesc: 'Updated override currency',
                  longDesc: 'The updated currency code for the override price.',
                },
              },
            },
          },
        },
        quantity: {
          displayName: 'Quantity Limits',
          shortDesc: 'Updated quantity limits',
          longDesc: 'Updated limits on how many units can be purchased.',
          fields: {
            minimum: {
              displayName: 'Minimum Quantity',
              shortDesc: 'Updated minimum quantity',
              longDesc: 'The updated minimum number of units that must be purchased.',
            },
            maximum: {
              displayName: 'Maximum Quantity',
              shortDesc: 'Updated maximum quantity',
              longDesc: 'The updated maximum number of units that can be purchased.',
            },
          },
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Updated price status',
          longDesc: 'The updated status of the price (e.g., active, archived).',
        },
        custom_data: {
          displayName: 'Custom Data',
          shortDesc: 'Updated custom metadata',
          longDesc: 'Updated custom metadata to store with the price as key-value pairs.',
        },
      },
    },
  },
  triggers: {},
};

export default PaddleAppEn;
