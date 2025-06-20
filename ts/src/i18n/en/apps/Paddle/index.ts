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

    create_customer: {
      displayName: 'Create Customer',
      shortDesc: 'Create a new customer in Paddle',
      longDesc:
        'Creates a new customer in Paddle with the specified email address and optional additional information such as name, locale, and custom data.',
      options: {
        email: {
          displayName: 'Email',
          shortDesc: 'Customer email address',
          longDesc:
            'The email address of the customer. This is required and must be a valid email address.',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Customer name',
          longDesc:
            'The full name of the customer. This is optional but recommended for better customer experience.',
        },
        locale: {
          displayName: 'Locale',
          shortDesc: 'Customer locale/language',
          longDesc:
            'The preferred language/locale for the customer. This affects email communications and checkout experience.',
        },
        custom_data: {
          displayName: 'Custom Data',
          shortDesc: 'Additional custom data',
          longDesc: 'Custom key-value pairs to store additional information about the customer.',
          type: {
            fields: {
              key: {
                displayName: 'Key',
                shortDesc: 'Custom data key',
                longDesc: 'The key for the custom data field.',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Custom data value',
                longDesc: 'The value for the custom data field.',
              },
            },
          },
        },
      },
    },

    get_customer: {
      displayName: 'Get Customer',
      shortDesc: 'Retrieve customer details by ID',
      longDesc:
        'Retrieves detailed information about a specific customer using their unique customer ID.',
      options: {
        customer_id: {
          displayName: 'Customer ID',
          shortDesc: 'The customer ID to retrieve',
          longDesc: 'The unique identifier of the customer whose details you want to retrieve.',
        },
      },
    },

    get_customer_auth_token: {
      displayName: 'Get Customer Auth Token',
      shortDesc: 'Generate authentication token for customer',
      longDesc:
        'Generates a temporary authentication token that allows a customer to access their billing portal or make authenticated requests.',
      options: {
        customer_id: {
          displayName: 'Customer ID',
          shortDesc: 'The customer ID to generate token for',
          longDesc:
            'The unique identifier of the customer for whom to generate the authentication token.',
        },
      },
    },

    list_customer_credit_balances: {
      displayName: 'List Customer Credit Balances',
      shortDesc: 'Get customer credit balances',
      longDesc:
        'Retrieves the credit balances for a specific customer, optionally filtered by currency code.',
      options: {
        customer_id: {
          displayName: 'Customer ID',
          shortDesc: 'The customer ID to get balances for',
          longDesc:
            'The unique identifier of the customer whose credit balances you want to retrieve.',
        },
        currency_code: {
          displayName: 'Currency Code',
          shortDesc: 'Filter by currency codes',
          longDesc:
            'Optional list of currency codes to filter the credit balances. If not specified, all currency balances will be returned.',
        },
      },
    },

    list_customers: {
      displayName: 'List Customers',
      shortDesc: 'Retrieve a list of customers',
      longDesc:
        'Retrieves a paginated list of customers with support for filtering, searching, and sorting options.',
      options: {
        after: {
          displayName: 'After',
          shortDesc: 'Pagination cursor',
          longDesc: 'Used for pagination. Returns customers after the specified cursor.',
        },
        email: {
          displayName: 'Email',
          shortDesc: 'Filter by email addresses',
          longDesc:
            'Filter customers by specific email addresses. You can specify multiple email addresses.',
        },
        id: {
          displayName: 'Customer IDs',
          shortDesc: 'Filter by customer IDs',
          longDesc:
            'Filter customers by specific customer IDs. You can specify multiple customer IDs.',
        },
        order: {
          displayName: 'Sort Order',
          shortDesc: 'Sort configuration',
          longDesc: 'Configure how to sort the results.',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc: 'The field to sort the results by.',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'Sort direction',
                longDesc: 'The direction to sort the results - ascending or descending.',
              },
            },
          },
        },
        per_page: {
          displayName: 'Per Page',
          shortDesc: 'Number of results per page',
          longDesc: 'The number of customers to return per page. Maximum is 200, default is 50.',
        },
        search: {
          displayName: 'Search',
          shortDesc: 'Search term',
          longDesc: 'Search customers by name or email address using a free-text search.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Filter by customer status',
          longDesc: 'Filter customers by their status (active, archived, etc.).',
        },
      },
    },

    update_customer: {
      displayName: 'Update Customer',
      shortDesc: 'Update customer information',
      longDesc:
        "Updates an existing customer's information including email, name, status, locale, and custom data.",
      options: {
        customer_id: {
          displayName: 'Customer ID',
          shortDesc: 'The customer ID to update',
          longDesc: 'The unique identifier of the customer to update.',
        },
        email: {
          displayName: 'Email',
          shortDesc: 'New customer email address',
          longDesc: 'The new email address for the customer. Must be a valid email address.',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'New customer name',
          longDesc: 'The new full name for the customer.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Customer status',
          longDesc: 'The new status for the customer (active, archived, etc.).',
        },
        locale: {
          displayName: 'Locale',
          shortDesc: 'Customer locale/language',
          longDesc: 'The new preferred language/locale for the customer.',
        },
        custom_data: {
          displayName: 'Custom Data',
          shortDesc: 'Updated custom data',
          longDesc:
            'Custom key-value pairs to update or add additional information about the customer.',
          type: {
            fields: {
              key: {
                displayName: 'Key',
                shortDesc: 'Custom data key',
                longDesc: 'The key for the custom data field.',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Custom data value',
                longDesc: 'The value for the custom data field.',
              },
            },
          },
        },
      },
    },

    get_report: {
      displayName: 'Get Report',
      shortDesc: 'Retrieve a specific report by ID',
      longDesc:
        'Fetches detailed information about a specific report including its status, filters, row count, and metadata.',
      options: {
        report_id: {
          displayName: 'Report ID',
          shortDesc: 'The ID of the report to retrieve',
          longDesc: 'The unique identifier of the report you want to fetch information for.',
        },
      },
    },

    get_report_file: {
      displayName: 'Get Report File',
      shortDesc: 'Download a report file as CSV',
      longDesc:
        'Downloads the CSV file for a completed report. Returns a URL to download the report data.',
      options: {
        report_id: {
          displayName: 'Report ID',
          shortDesc: 'The ID of the report file to download',
          longDesc: 'The unique identifier of the report whose CSV file you want to download.',
        },
      },
    },

    list_reports: {
      displayName: 'List Reports',
      shortDesc: 'List all reports with filtering and pagination',
      longDesc:
        'Retrieves a list of all reports with support for filtering by status, pagination, and sorting options.',
      options: {
        after: {
          displayName: 'After',
          shortDesc: 'Pagination cursor',
          longDesc:
            'Return reports after this cursor for pagination. Used to get the next page of results.',
        },
        order: {
          displayName: 'Sort Order',
          shortDesc: 'How to sort the results',
          longDesc: 'Specify the field and direction to sort the reports by.',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc: 'The field to use for sorting the reports.',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'Sort direction',
                longDesc: 'Whether to sort in ascending or descending order.',
              },
            },
          },
        },
        per_page: {
          displayName: 'Per Page',
          shortDesc: 'Number of reports per page',
          longDesc: 'The number of reports to return per page. Maximum is 200, default is 50.',
        },
        status: {
          displayName: 'Status Filter',
          shortDesc: 'Filter reports by status',
          longDesc: 'Filter the reports to only include those with the specified status values.',
        },
      },
    },

    create_report: {
      displayName: 'Create Report',
      shortDesc: 'Create a new report with optional filters',
      longDesc:
        'Creates a new report of the specified type with optional filters to narrow down the data included in the report.',
      options: {
        type: {
          displayName: 'Report Type',
          shortDesc: 'The type of report to create',
          longDesc:
            'The type of report you want to generate. Different types provide different data sets.',
        },
        filters: {
          displayName: 'Filters',
          shortDesc: 'Optional filters to apply to the report',
          longDesc:
            'Apply filters to limit the data included in the report based on specific criteria.',
          type: {
            fields: {
              name: {
                displayName: 'Filter Name',
                shortDesc: 'The name of the filter field',
                longDesc: 'The field name to filter by.',
              },
              operator: {
                displayName: 'Filter Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'The operator to use for comparing the filter value.',
              },
              value: {
                displayName: 'Filter Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The value to use for the filter comparison.',
              },
            },
          },
        },
      },
    },

    get_subscription: {
      displayName: 'Get Subscription',
      shortDesc: 'Retrieve a specific subscription by ID',
      longDesc:
        'Fetches detailed information about a specific subscription including its status, billing details, and optional related data.',
      options: {
        subscription_id: {
          displayName: 'Subscription ID',
          shortDesc: 'The ID of the subscription to retrieve',
          longDesc: 'The unique identifier of the subscription you want to fetch information for.',
        },
        include: {
          displayName: 'Include Additional Data',
          shortDesc: 'Additional data to include in the response',
          longDesc:
            'Specify additional related data to include with the subscription details, such as next transaction or recurring transaction details.',
        },
      },
    },

    list_subscriptions: {
      displayName: 'List Subscriptions',
      shortDesc: 'List subscriptions with filtering and pagination',
      longDesc:
        'Retrieves a list of subscriptions with support for filtering by customer, status, price, and other criteria, plus pagination and sorting options.',
      options: {
        customer_id: {
          displayName: 'Customer ID',
          shortDesc: 'Filter by customer ID',
          longDesc:
            'Filter subscriptions to only include those belonging to the specified customer.',
        },
        address_id: {
          displayName: 'Address IDs',
          shortDesc: 'Filter by customer address IDs',
          longDesc:
            'Filter subscriptions to only include those associated with the specified customer address IDs.',
        },
        after: {
          displayName: 'After',
          shortDesc: 'Pagination cursor',
          longDesc:
            'Return subscriptions after this cursor for pagination. Used to get the next page of results.',
        },
        collection_mode: {
          displayName: 'Collection Mode',
          shortDesc: 'Filter by payment collection mode',
          longDesc:
            'Filter subscriptions by how payments are collected - either automatically or manually.',
        },
        id: {
          displayName: 'Subscription IDs',
          shortDesc: 'Filter by specific subscription IDs',
          longDesc: 'Filter to only include subscriptions with the specified IDs.',
        },
        order: {
          displayName: 'Sort Order',
          shortDesc: 'How to sort the results',
          longDesc: 'Specify the field and direction to sort the subscriptions by.',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc: 'The field to use for sorting the subscriptions.',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'Sort direction',
                longDesc: 'Whether to sort in ascending or descending order.',
              },
            },
          },
        },
        per_page: {
          displayName: 'Per Page',
          shortDesc: 'Number of subscriptions per page',
          longDesc:
            'The number of subscriptions to return per page. Maximum is 200, default is 50.',
        },
        price_id: {
          displayName: 'Price IDs',
          shortDesc: 'Filter by price IDs',
          longDesc:
            'Filter subscriptions to only include those associated with the specified price IDs.',
        },
        scheduled_change_action: {
          displayName: 'Scheduled Change Actions',
          shortDesc: 'Filter by scheduled change actions',
          longDesc:
            'Filter subscriptions that have scheduled changes with the specified actions (cancel, pause, resume).',
        },
        status: {
          displayName: 'Status Filter',
          shortDesc: 'Filter subscriptions by status',
          longDesc:
            'Filter subscriptions to only include those with the specified status values (active, canceled, past_due, paused, trialing).',
        },
      },
    },

    create_transaction: {
      displayName: 'Create Transaction',
      shortDesc: 'Create a new transaction with items and billing details',
      longDesc:
        'Creates a new transaction with specified items, customer information, billing details, and payment configuration. Supports both automatic and manual collection modes.',
      options: {
        include: {
          displayName: 'Include Additional Data',
          shortDesc: 'Additional data to include in the response',
          longDesc: 'Specify additional related data to include with the transaction details.',
        },
        items: {
          displayName: 'Transaction Items',
          shortDesc: 'Items to include in the transaction',
          longDesc:
            'List of items to include in the transaction, each with a price ID and quantity.',
          type: {
            fields: {
              price_id: {
                displayName: 'Price ID',
                shortDesc: 'The price ID for this item',
                longDesc: 'The unique identifier of the price to use for this transaction item.',
              },
              quantity: {
                displayName: 'Quantity',
                shortDesc: 'Quantity of this item',
                longDesc: 'The number of units of this item to include in the transaction.',
              },
            },
          },
        },
        status: {
          displayName: 'Transaction Status',
          shortDesc: 'Initial status of the transaction',
          longDesc: 'Set the initial status of the transaction - either billed or canceled.',
        },
        customer_id: {
          displayName: 'Customer ID',
          shortDesc: 'ID of the customer for this transaction',
          longDesc:
            'The unique identifier of the customer who will be charged for this transaction.',
        },
        address_id: {
          displayName: 'Address ID',
          shortDesc: 'Customer address ID for billing',
          longDesc: 'The ID of the customer address to use for billing and tax calculations.',
        },
        business_id: {
          displayName: 'Business ID',
          shortDesc: 'Customer business ID',
          longDesc: 'The ID of the customer business entity associated with this transaction.',
        },
        custom_data: {
          displayName: 'Custom Data',
          shortDesc: 'Custom metadata for the transaction',
          longDesc: 'Custom key-value pairs to store additional information with the transaction.',
        },
        currency_code: {
          displayName: 'Currency Code',
          shortDesc: 'Currency for the transaction',
          longDesc: 'The three-letter ISO currency code for this transaction.',
        },
        collection_mode: {
          displayName: 'Collection Mode',
          shortDesc: 'How payment will be collected',
          longDesc: 'Specify whether payment should be collected automatically or manually.',
        },
        discount_id: {
          displayName: 'Discount ID',
          shortDesc: 'Discount to apply to the transaction',
          longDesc: 'The ID of a discount to apply to this transaction.',
        },
        billing_details: {
          displayName: 'Billing Details',
          shortDesc: 'Billing configuration for the transaction',
          longDesc:
            'Billing details including payment terms, checkout settings, and additional information.',
          type: {
            fields: {
              payment_terms: {
                displayName: 'Payment Terms',
                shortDesc: 'Payment term configuration',
                longDesc: 'Define the payment terms including interval and frequency.',
                type: {
                  fields: {
                    interval: {
                      displayName: 'Interval',
                      shortDesc: 'Payment interval unit',
                      longDesc:
                        'The unit of time for the payment interval (day, week, month, year).',
                    },
                    frequency: {
                      displayName: 'Frequency',
                      shortDesc: 'Payment frequency',
                      longDesc: 'How often payments occur within the specified interval.',
                    },
                  },
                },
              },
              enable_checkout: {
                displayName: 'Enable Checkout',
                shortDesc: 'Whether to enable checkout',
                longDesc: 'Enable or disable the checkout process for this transaction.',
              },
              purchase_order_number: {
                displayName: 'Purchase Order Number',
                shortDesc: 'Purchase order reference',
                longDesc: 'A purchase order number for reference and tracking purposes.',
              },
              additional_information: {
                displayName: 'Additional Information',
                shortDesc: 'Extra billing information',
                longDesc: 'Any additional information to include with the billing details.',
              },
            },
          },
        },
        billing_period: {
          displayName: 'Billing Period',
          shortDesc: 'Time period for billing',
          longDesc: 'Define the start and end dates for the billing period.',
          type: {
            fields: {
              ends_at: {
                displayName: 'End Date',
                shortDesc: 'Billing period end date',
                longDesc: 'The date when the billing period ends.',
              },
              starts_at: {
                displayName: 'Start Date',
                shortDesc: 'Billing period start date',
                longDesc: 'The date when the billing period starts.',
              },
            },
          },
        },
        checkout_url: {
          displayName: 'Checkout URL',
          shortDesc: 'Custom checkout URL',
          longDesc: 'A custom URL to redirect customers to for checkout completion.',
        },
      },
    },

    get_transaction: {
      displayName: 'Get Transaction',
      shortDesc: 'Retrieve a specific transaction by ID',
      longDesc:
        'Fetches detailed information about a specific transaction including its items, customer details, and payment status.',
      options: {
        transaction_id: {
          displayName: 'Transaction ID',
          shortDesc: 'The ID of the transaction to retrieve',
          longDesc: 'The unique identifier of the transaction you want to fetch information for.',
        },
        include: {
          displayName: 'Include Additional Data',
          shortDesc: 'Additional data to include in the response',
          longDesc: 'Specify additional related data to include with the transaction details.',
        },
      },
    },

    list_transactions: {
      displayName: 'List Transactions',
      shortDesc: 'List transactions with filtering and pagination',
      longDesc:
        'Retrieves a list of transactions with support for filtering by date, customer, status, origin, and other criteria, plus pagination and sorting options.',
      options: {
        after: {
          displayName: 'After',
          shortDesc: 'Pagination cursor',
          longDesc:
            'Return transactions after this cursor for pagination. Used to get the next page of results.',
        },
        billed_at: {
          displayName: 'Billed At Filter',
          shortDesc: 'Filter by billing date',
          longDesc:
            'Filter transactions based on when they were billed using date comparison operators.',
          type: {
            fields: {
              operator: {
                displayName: 'Date Operator',
                shortDesc: 'Comparison operator for the date',
                longDesc: 'The operator to use for comparing the billed date.',
              },
              value: {
                displayName: 'Date Value',
                shortDesc: 'The date to compare against',
                longDesc: 'The date value to use for the comparison.',
              },
            },
          },
        },
        created_at: {
          displayName: 'Created At Filter',
          shortDesc: 'Filter by creation date',
          longDesc:
            'Filter transactions based on when they were created using date comparison operators.',
          type: {
            fields: {
              operator: {
                displayName: 'Date Operator',
                shortDesc: 'Comparison operator for the date',
                longDesc: 'The operator to use for comparing the creation date.',
              },
              value: {
                displayName: 'Date Value',
                shortDesc: 'The date to compare against',
                longDesc: 'The date value to use for the comparison.',
              },
            },
          },
        },
        updated_at: {
          displayName: 'Updated At Filter',
          shortDesc: 'Filter by last update date',
          longDesc:
            'Filter transactions based on when they were last updated using date comparison operators.',
          type: {
            fields: {
              operator: {
                displayName: 'Date Operator',
                shortDesc: 'Comparison operator for the date',
                longDesc: 'The operator to use for comparing the update date.',
              },
              value: {
                displayName: 'Date Value',
                shortDesc: 'The date to compare against',
                longDesc: 'The date value to use for the comparison.',
              },
            },
          },
        },
        customer_id: {
          displayName: 'Customer IDs',
          shortDesc: 'Filter by customer IDs',
          longDesc:
            'Filter transactions to only include those belonging to the specified customers.',
        },
        invoice_number: {
          displayName: 'Invoice Numbers',
          shortDesc: 'Filter by invoice numbers',
          longDesc: 'Filter transactions to only include those with the specified invoice numbers.',
        },
        origin: {
          displayName: 'Transaction Origins',
          shortDesc: 'Filter by transaction origin',
          longDesc:
            'Filter transactions based on how they were created (API, subscription billing, etc.).',
        },
        order: {
          displayName: 'Sort Order',
          shortDesc: 'How to sort the results',
          longDesc: 'Specify the field and direction to sort the transactions by.',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc: 'The field to use for sorting the transactions.',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'Sort direction',
                longDesc: 'Whether to sort in ascending or descending order.',
              },
            },
          },
        },
        status: {
          displayName: 'Status Filter',
          shortDesc: 'Filter transactions by status',
          longDesc: 'Filter transactions to only include those with the specified status values.',
        },
        subscription_id: {
          displayName: 'Subscription IDs',
          shortDesc: 'Filter by subscription IDs',
          longDesc:
            'Filter transactions to only include those associated with the specified subscriptions.',
        },
        per_page: {
          displayName: 'Per Page',
          shortDesc: 'Number of transactions per page',
          longDesc: 'The number of transactions to return per page. Maximum is 200, default is 50.',
        },
      },
    },
  },
  triggers: {},
};

export default PaddleAppEn;
