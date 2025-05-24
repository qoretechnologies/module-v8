

const ShopifyAppEn = {
  displayName: 'Shopify',
  shortDesc: 'E-commerce platform for online stores and retail point of sale',
  longDesc:
    'Shopify is a comprehensive commerce platform that allows businesses to start, grow, and manage an online store, sell in multiple places, and synchronize online and in-person sales.',
  actions: {
    'find-product': {
      displayName: 'Find Products',
      shortDesc: 'Search for products in your store',
      longDesc:
        'Search and filter products in your Shopify store based on various criteria including title, vendor, product type, and more.',
      options: {
        titleQuery: {
          displayName: 'Title',
          shortDesc: 'Search by product title',
          longDesc: 'Filter products by matching text in their titles. Supports partial matches.',
        },
        vendorQuery: {
          displayName: 'Vendor',
          shortDesc: 'Filter by product vendor',
          longDesc: 'Find products from specific vendors or suppliers in your store.',
        },
        productTypeQuery: {
          displayName: 'Product Type',
          shortDesc: 'Filter by product type',
          longDesc: 'Search for products based on their assigned product type category.',
        },
        tagQuery: {
          displayName: 'Tags',
          shortDesc: 'Search by product tags',
          longDesc: 'Find products that have been tagged with specific keywords or labels.',
        },
        skuQuery: {
          displayName: 'SKU',
          shortDesc: 'Search by product SKU',
          longDesc: 'Look up products using their Stock Keeping Unit (SKU) identifier.',
        },
        barcodeQuery: {
          displayName: 'Barcode',
          shortDesc: 'Search by barcode',
          longDesc: 'Find products using their UPC, ISBN, or other barcode identifiers.',
        },
        productIdQuery: {
          displayName: 'Product ID',
          shortDesc: 'Search by product ID',
          longDesc: 'Look up a specific product using its unique Shopify product ID.',
        },
        collectionIdQuery: {
          displayName: 'Collection',
          shortDesc: 'Filter by collection ID',
          longDesc: 'Find products that belong to a specific collection in your store.',
        },
        sortKey: {
          displayName: 'Sort By',
          shortDesc: 'Sort the results',
          longDesc: 'Choose how to order the results (e.g., by title, price, created date).',
        },
        reverse: {
          displayName: 'Reverse Order',
          shortDesc: 'Reverse the sort order',
          longDesc: 'Toggle between ascending and descending sort order for the results.',
        },
        rawQuery: {
          displayName: 'Advanced Query',
          shortDesc: 'Use custom search syntax',
          longDesc:
            'Enter a custom search query for advanced filtering using Shopify search syntax.',
        },
        limit: {
          displayName: 'Results Limit',
          shortDesc: 'Maximum number of results',
          longDesc: 'Specify the maximum number of products to return in the search results.',
        },
        cursor: {
          displayName: 'Pagination Cursor',
          shortDesc: 'Navigate through pages of results',
          longDesc: 'Use a cursor to paginate through large sets of search results.',
        },
      },
    },
    'find-order': {
      displayName: 'Find Orders',
      shortDesc: 'Search for customer orders',
      longDesc:
        'Search and filter orders in your Shopify store based on various criteria including customer name, email, order number, and more.',
      options: {
        name: {
          displayName: 'Order Number',
          shortDesc: 'Search by order number',
          longDesc: 'Look up orders using their confirmation or order number.',
        },
        email: {
          displayName: 'Email',
          shortDesc: 'Search by customer email',
          longDesc: 'Find orders associated with a specific customer email address.',
        },
        customer_id: {
          displayName: 'Customer ID',
          shortDesc: 'Filter by customer ID',
          longDesc:
            'Find all orders placed by a specific customer using their Shopify customer ID.',
        },
        confirmation_number: {
          displayName: 'Confirmation Number',
          shortDesc: 'Search by confirmation number',
          longDesc: 'Find orders by their unique confirmation number provided to customers.',
        },
        id: {
          displayName: 'Order ID',
          shortDesc: 'Search by order ID',
          longDesc: 'Look up a specific order using its unique Shopify order ID.',
        },
        financial_status: {
          displayName: 'Payment Status',
          shortDesc: 'Filter by payment status',
          longDesc: 'Find orders with a specific payment status (paid, pending, refunded, etc.).',
        },
        fulfillment_status: {
          displayName: 'Fulfillment Status',
          shortDesc: 'Filter by shipping status',
          longDesc:
            'Find orders with a specific fulfillment status (fulfilled, unfulfilled, shipped, etc.).',
        },
        status: {
          displayName: 'Order Status',
          shortDesc: 'Filter by order status',
          longDesc: 'Find orders based on their overall status (open, closed, cancelled).',
        },
        source_name: {
          displayName: 'Source',
          shortDesc: 'Filter by order source',
          longDesc: 'Find orders from specific sources (e.g., web, draft orders, POS).',
        },
        sales_channel: {
          displayName: 'Sales Channel',
          shortDesc: 'Filter by sales channel',
          longDesc: 'Find orders from specific sales channels configured in your Shopify store.',
        },
        sku: {
          displayName: 'Product SKU',
          shortDesc: 'Search by product SKU',
          longDesc: 'Find orders containing products with a specific SKU.',
        },
        created_at: {
          displayName: 'Created Date',
          shortDesc: 'Filter by creation date',
          longDesc:
            'Find orders created on a specific date or within a date range (e.g., 2021-01-01, <now, <=2024).',
        },
        updated_at: {
          displayName: 'Updated Date',
          shortDesc: 'Filter by last update date',
          longDesc: 'Find orders last updated on a specific date or within a date range.',
        },
        processed_at: {
          displayName: 'Processed Date',
          shortDesc: 'Filter by processed date',
          longDesc: 'Find orders processed on a specific date or within a date range.',
        },
        tag: {
          displayName: 'Tag',
          shortDesc: 'Filter by order tag',
          longDesc: 'Find orders that have been tagged with specific labels in Shopify.',
        },
        test: {
          displayName: 'Test Orders',
          shortDesc: 'Include/exclude test orders',
          longDesc: 'Filter to show only test orders (true) or exclude test orders (false).',
        },
        location_id: {
          displayName: 'Location',
          shortDesc: 'Filter by store location',
          longDesc: 'Find orders associated with a specific store location or fulfillment center.',
        },
        po_number: {
          displayName: 'Purchase Order Number',
          shortDesc: 'Search by PO number',
          longDesc: 'Find orders associated with a specific purchase order number.',
        },
        rawQuery: {
          displayName: 'Advanced Query',
          shortDesc: 'Use custom search syntax',
          longDesc:
            'Enter a custom search query for advanced filtering using Shopify search syntax.',
        },
        sortKey: {
          displayName: 'Sort By',
          shortDesc: 'Sort the results',
          longDesc: 'Choose how to order the results (e.g., by date, order number, total value).',
        },
        reverse: {
          displayName: 'Reverse Order',
          shortDesc: 'Reverse the sort order',
          longDesc: 'Toggle between ascending and descending sort order for the results.',
        },
        limit: {
          displayName: 'Results Limit',
          shortDesc: 'Maximum number of results',
          longDesc:
            'Specify the maximum number of orders to return in the search results (max: 250).',
        },
        cursor: {
          displayName: 'Pagination Cursor',
          shortDesc: 'Navigate through pages of results',
          longDesc: 'Use a cursor to paginate through large sets of search results.',
        },
      },
    },
    'find-customer': {
      displayName: 'Find Customers',
      shortDesc: 'Search for customers',
      longDesc:
        'Search and filter customers in your Shopify store based on names, emails, or other attributes.',
      options: {
        query: {
          displayName: 'Search Query',
          shortDesc: 'Search by name or email',
          longDesc: 'Search for customers by their name, email, or other identifying information.',
        },
        limit: {
          displayName: 'Results Limit',
          shortDesc: 'Maximum number of results',
          longDesc: 'Specify the maximum number of customers to return in the search results.',
        },
        cursor: {
          displayName: 'Pagination Cursor',
          shortDesc: 'Navigate through pages of results',
          longDesc: 'Use a cursor to paginate through large sets of search results.',
        },
        sortKey: {
          displayName: 'Sort By',
          shortDesc: 'Sort the results',
          longDesc: 'Choose how to order the results (e.g., by name, date created, total spent).',
        },
        reverse: {
          displayName: 'Reverse Order',
          shortDesc: 'Reverse the sort order',
          longDesc: 'Toggle between ascending and descending sort order for the results.',
        },
      },
    },
    'find-variant': {
      displayName: 'Find Product Variants',
      shortDesc: 'Search for specific product variants',
      longDesc:
        'Search and filter product variants in your Shopify store based on criteria like SKU, barcode, price, or inventory status.',
      options: {
        productId: {
          displayName: 'Product ID',
          shortDesc: 'Filter by parent product',
          longDesc:
            'Find variants that belong to a specific parent product using its Shopify product ID.',
        },
        title: {
          displayName: 'Variant Title',
          shortDesc: 'Search by variant title',
          longDesc: 'Filter variants by matching text in their titles or option values.',
        },
        sku: {
          displayName: 'SKU',
          shortDesc: 'Search by variant SKU',
          longDesc: 'Look up variants using their Stock Keeping Unit (SKU) identifier.',
        },
        barcode: {
          displayName: 'Barcode',
          shortDesc: 'Search by barcode',
          longDesc: 'Find variants using their UPC, ISBN, or other barcode identifiers.',
        },
        id: {
          displayName: 'Variant ID',
          shortDesc: 'Search by variant ID',
          longDesc: 'Look up a specific variant using its unique Shopify variant ID.',
        },
        inventoryQuantity: {
          displayName: 'Inventory Quantity',
          shortDesc: 'Filter by inventory quantity',
          longDesc:
            'Find variants based on their exact inventory quantity or range (e.g., "inventory_quantity:10" or "inventory_quantity:>5").',
        },
        productStatus: {
          displayName: 'Product Status',
          shortDesc: 'Filter by product status',
          longDesc:
            'Find variants based on whether their parent product is active, draft, or archived.',
        },
        productType: {
          displayName: 'Product Type',
          shortDesc: 'Filter by product type',
          longDesc: 'Find variants belonging to products of a specific type or category.',
        },
        tag: {
          displayName: 'Product Tag',
          shortDesc: 'Filter by product tag',
          longDesc: 'Find variants belonging to products that have a specific tag.',
        },
        tagNot: {
          displayName: 'Exclude Tag',
          shortDesc: 'Filter out products with tag',
          longDesc: 'Find variants belonging to products that do not have a specific tag.',
        },
        vendor: {
          displayName: 'Vendor',
          shortDesc: 'Filter by vendor or supplier',
          longDesc: 'Find variants belonging to products from a specific vendor or supplier.',
        },
        collection: {
          displayName: 'Collection',
          shortDesc: 'Filter by collection',
          longDesc:
            'Find variants belonging to products in a specific collection using the collection ID.',
        },
        option1: {
          displayName: 'Option 1',
          shortDesc: 'Filter by first option',
          longDesc:
            'Find variants with a specific value for their first option (e.g., Size, Color).',
        },
        option2: {
          displayName: 'Option 2',
          shortDesc: 'Filter by second option',
          longDesc: 'Find variants with a specific value for their second option.',
        },
        option3: {
          displayName: 'Option 3',
          shortDesc: 'Filter by third option',
          longDesc: 'Find variants with a specific value for their third option.',
        },
        taxable: {
          displayName: 'Taxable',
          shortDesc: 'Filter by tax status',
          longDesc: 'Find variants based on whether they are taxable or non-taxable.',
        },
        updatedAt: {
          displayName: 'Updated At',
          shortDesc: 'Filter by update time',
          longDesc:
            'Find variants based on when they were last updated (e.g., "updated_at:>2023-01-01" or "updated_at:<now").',
        },
        rawQuery: {
          displayName: 'Advanced Query',
          shortDesc: 'Use custom search syntax',
          longDesc:
            'Enter a custom search query for advanced filtering using Shopify search syntax.',
        },
        sortKey: {
          displayName: 'Sort By',
          shortDesc: 'Order results by field',
          longDesc: 'Specify which field to use for sorting the results.',
        },
        reverse: {
          displayName: 'Reverse Order',
          shortDesc: 'Reverse the sort order',
          longDesc: 'When enabled, reverses the order of the results (e.g., Z-A instead of A-Z).',
        },
        limit: {
          displayName: 'Results Limit',
          shortDesc: 'Maximum number of results',
          longDesc:
            'Specify the maximum number of variants to return in the search results (max: 250).',
        },
        cursor: {
          displayName: 'Pagination Cursor',
          shortDesc: 'Navigate through pages of results',
          longDesc: 'Use a cursor to paginate through large sets of search results.',
        },
      },
    },
    'add-line-item-to-order': {
      displayName: 'Add Line Item to Order',
      shortDesc: 'Add a new product line to an existing order',
      longDesc:
        'Allows adding a new line item to an existing order, with options for quantity, pricing, and other product details',
      options: {
        orderId: {
          displayName: 'Order ID',
          shortDesc: 'Unique identifier of the order',
          longDesc: 'The specific order to which the line item will be added',
        },
        type: {
          displayName: 'Line Item Type',
          shortDesc: 'Type of line item being added',
          longDesc: 'Specifies the nature of the line item (e.g., product, shipping, tax)',
        },
        quantity: {
          displayName: 'Quantity',
          shortDesc: 'Number of items to add',
          longDesc: 'The quantity of the specific product being added to the order',
        },
        locationId: {
          displayName: 'Location ID',
          shortDesc: 'Inventory location',
          longDesc: 'The specific warehouse or store location where the item is stocked',
        },
        reason: {
          displayName: 'Reason',
          shortDesc: 'Reason for adding line item',
          longDesc: 'Explanation for why the line item is being added to the order',
        },
        notifyCustomer: {
          displayName: 'Notify Customer',
          shortDesc: 'Send notification about order change',
          longDesc:
            'Determines whether the customer should be notified about the line item addition',
        },
        variantId: {
          displayName: 'Variant ID',
          shortDesc: 'Specific product variant',
          longDesc: 'Unique identifier for the specific product variant being added',
        },
        allowDuplicates: {
          displayName: 'Allow Duplicates',
          shortDesc: 'Permit duplicate line items',
          longDesc: 'Whether identical line items can be added multiple times to the order',
        },
        itemName: {
          displayName: 'Item Name',
          shortDesc: 'Name of the product',
          longDesc: 'The display name or title of the product being added',
        },
        price: {
          displayName: 'Price',
          shortDesc: 'Price of the line item',
          longDesc: 'The unit price of the product being added to the order',
        },
        currency: {
          displayName: 'Currency',
          shortDesc: 'Currency of the price',
          longDesc: 'The currency in which the price is specified',
        },
        isTaxable: {
          displayName: 'Is Taxable',
          shortDesc: 'Whether item is subject to tax',
          longDesc: 'Indicates if the line item should have tax applied',
        },
        isPhysical: {
          displayName: 'Is Physical',
          shortDesc: 'Physical vs digital product',
          longDesc: 'Specifies whether the item is a physical product requiring shipping',
        },
      },
    },
    'create-gift-card': {
      displayName: 'Create Gift Card',
      shortDesc: 'Generate a new gift card',
      longDesc:
        'Create a gift card with customizable parameters like initial value, expiration, and recipient details',
      options: {
        initialValue: {
          displayName: 'Initial Value',
          shortDesc: 'Starting balance of gift card',
          longDesc: 'The initial monetary amount loaded onto the gift card',
        },
        customerId: {
          displayName: 'Customer ID',
          shortDesc: 'ID of gift card recipient',
          longDesc: 'The unique identifier of the customer receiving the gift card',
        },
        note: {
          displayName: 'Note',
          shortDesc: 'Additional gift card information',
          longDesc: 'A personal message or additional details about the gift card',
        },
        expiresOn: {
          displayName: 'Expiration Date',
          shortDesc: 'Date when gift card expires',
          longDesc: 'The date after which the gift card will no longer be valid',
        },
        code: {
          displayName: 'Gift Card Code',
          shortDesc: 'Unique gift card identifier',
          longDesc: 'The specific code used to redeem the gift card',
        },
        templateSuffix: {
          displayName: 'Template Suffix',
          shortDesc: 'Customization of gift card template',
          longDesc: "Optional suffix to customize the gift card's appearance or template",
        },
        recipientAttributes: {
          displayName: 'Recipient Attributes',
          shortDesc: 'Details about gift card recipient',
          longDesc: 'Additional information about the person receiving the gift card',
          type: {
            fields: {
              id: {
                displayName: 'Recipient ID',
                shortDesc: 'Unique identifier for recipient',
                longDesc: 'A unique identifier for the gift card recipient',
              },
              message: {
                displayName: 'Recipient Message',
                shortDesc: 'Personal message to recipient',
                longDesc: 'A personalized message to accompany the gift card',
              },
              preferredName: {
                displayName: 'Preferred Name',
                shortDesc: "Recipient's preferred name",
                longDesc: 'The name the recipient prefers to be called',
              },
              sendNotificationAt: {
                displayName: 'Notification Timing',
                shortDesc: 'When to send gift card notification',
                longDesc: 'The specific time or date to send the gift card notification',
              },
            },
          },
        },
      },
    },
    'create-fulfillment': {
      displayName: 'Create Fulfillment',
      shortDesc: 'Process and ship an order',
      longDesc: 'Create a fulfillment for an order, handling shipping and tracking information',
      options: {
        fulfillmentOrderId: {
          displayName: 'Fulfillment Order ID',
          shortDesc: 'Unique fulfillment order identifier',
          longDesc: 'The specific fulfillment order being processed',
        },
        fulfillmentOrderLineItems: {
          displayName: 'Fulfillment Order Line Items',
          shortDesc: 'Items in the fulfillment order',
          longDesc: 'Specific line items within the fulfillment order',
          type: {
            fields: {
              id: {
                displayName: 'Line Item ID',
                shortDesc: 'Unique identifier for line item',
                longDesc: 'The specific identifier for an individual line item',
              },
              quantity: {
                displayName: 'Quantity',
                shortDesc: 'Number of items to fulfill',
                longDesc: 'The quantity of the specific item being fulfilled',
              },
            },
          },
        },
        notifyCustomer: {
          displayName: 'Notify Customer',
          shortDesc: 'Send shipping notification',
          longDesc:
            'Determines whether to send a notification to the customer about the fulfillment',
        },
        trackingInfo: {
          displayName: 'Tracking Information',
          shortDesc: 'Shipping tracking details',
          longDesc: 'Information for tracking the shipment',
          type: {
            fields: {
              number: {
                displayName: 'Tracking Number',
                shortDesc: 'Shipment tracking number',
                longDesc: 'The unique identifier for tracking the shipment',
              },
              url: {
                displayName: 'Tracking URL',
                shortDesc: 'Link to track shipment',
                longDesc: 'The web address where the shipment can be tracked',
              },
              company: {
                displayName: 'Shipping Company',
                shortDesc: 'Name of shipping carrier',
                longDesc: 'The name of the company responsible for shipping',
              },
            },
          },
        },
        message: {
          displayName: 'Message',
          shortDesc: 'Additional fulfillment notes',
          longDesc: 'Any additional information or notes about the fulfillment',
        },
        originAddress: {
          displayName: 'Origin Address',
          shortDesc: 'Shipping origin location',
          longDesc: 'The address from which the items are being shipped',
          type: {
            fields: {
              address1: {
                displayName: 'Address Line 1',
                shortDesc: 'Primary address line',
                longDesc: 'The first line of the shipping origin address',
              },
              address2: {
                displayName: 'Address Line 2',
                shortDesc: 'Secondary address line',
                longDesc: 'Optional additional address information',
              },
              city: {
                displayName: 'City',
                shortDesc: 'City of origin',
                longDesc: 'The city from which the shipment originates',
              },
              countryCode: {
                displayName: 'Country Code',
                shortDesc: 'Origin country code',
                longDesc: 'The two-letter country code for the shipping origin',
              },
              provinceCode: {
                displayName: 'Province Code',
                shortDesc: 'State or province code',
                longDesc: 'The code representing the state or province of origin',
              },
              zip: {
                displayName: 'Postal Code',
                shortDesc: 'Origin postal code',
                longDesc: 'The postal code of the shipping origin',
              },
            },
          },
        },
      },
    },
    'create-draft-order': {
      displayName: 'Create Draft Order',
      shortDesc: 'Creates a new draft order in Shopify',
      longDesc:
        'Generates a draft order that can be used to create an order manually, send invoices, or process payments later. Draft orders are useful for custom sales, wholesale orders, or pre-orders.',
      options: {
        customerId: {
          displayName: 'Customer ID',
          shortDesc: 'The ID of the customer for the draft order',
          longDesc:
            'Specifies the unique identifier of the customer to associate with this draft order. Required if not using default address.',
        },
        email: {
          displayName: 'Email',
          shortDesc: 'Customer email address',
          longDesc:
            'The email address of the customer, used for notifications and order confirmation.',
        },
        phone: {
          displayName: 'Phone',
          shortDesc: 'Customer phone number',
          longDesc:
            'The phone number of the customer, useful for shipping updates or contact purposes.',
        },
        note: {
          displayName: 'Note',
          shortDesc: 'Additional notes for the draft order',
          longDesc:
            'A field for adding internal notes about the draft order, such as special instructions or context.',
        },
        taxExempt: {
          displayName: 'Tax Exempt',
          shortDesc: 'Exempt order from taxes',
          longDesc:
            'Indicates whether the entire order is exempt from taxes. Set to true for tax-exempt customers.',
        },
        taxExemptions: {
          displayName: 'Tax Exemptions',
          shortDesc: 'Specific tax exemptions',
          longDesc:
            'List of specific tax exemptions applied to the draft order, such as regional or product-specific exemptions.',
          type: {
            element_type: {
              displayName: 'Tax Exemption Type',
              shortDesc: 'Type of tax exemption',
              longDesc: 'Defines the specific tax exemption applied, e.g., GST, VAT, or sales tax.',
            },
          },
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Tags for the draft order',
          longDesc:
            'A list of tags to categorize or filter the draft order, e.g., "wholesale", "pre-order".',
          type: {
            element_type: {
              displayName: 'Tag',
              shortDesc: 'Single tag value',
              longDesc:
                'A single string value used to tag the draft order for organization or search purposes.',
            },
          },
        },
        shippingAddress: {
          displayName: 'Shipping Address',
          shortDesc: 'Customer shipping address',
          longDesc:
            'The full shipping address where the order will be delivered, including all relevant fields.',
          type: {
            fields: {
              address1: {
                displayName: 'Address Line 1',
                shortDesc: 'Primary address line',
                longDesc: 'The street address or PO Box for shipping.',
              },
              address2: {
                displayName: 'Address Line 2',
                shortDesc: 'Secondary address line',
                longDesc: 'Additional address information like apartment or suite number.',
              },
              city: {
                displayName: 'City',
                shortDesc: 'Shipping city',
                longDesc: 'The city for the shipping address.',
              },
              province: {
                displayName: 'Province/State',
                shortDesc: 'Shipping province or state',
                longDesc: 'The province, state, or region for the shipping address.',
              },
              country: {
                displayName: 'Country',
                shortDesc: 'Shipping country',
                longDesc: 'The country for the shipping address.',
              },
              zip: {
                displayName: 'ZIP/Postal Code',
                shortDesc: 'Shipping postal code',
                longDesc: 'The ZIP or postal code for the shipping address.',
              },
              firstName: {
                displayName: 'First Name',
                shortDesc: 'Recipient first name',
                longDesc: 'The first name of the shipping recipient.',
              },
              lastName: {
                displayName: 'Last Name',
                shortDesc: 'Recipient last name',
                longDesc: 'The last name of the shipping recipient.',
              },
              company: {
                displayName: 'Company',
                shortDesc: 'Shipping company name',
                longDesc: 'The company name associated with the shipping address, if applicable.',
              },
              phone: {
                displayName: 'Phone',
                shortDesc: 'Shipping contact phone',
                longDesc: 'The phone number for the shipping recipient.',
              },
            },
          },
        },
        billingAddress: {
          displayName: 'Billing Address',
          shortDesc: 'Customer billing address',
          longDesc:
            'The address used for billing purposes, which may differ from the shipping address.',
          type: {
            fields: {
              address1: {
                displayName: 'Address Line 1',
                shortDesc: 'Primary billing address line',
                longDesc: 'The street address or PO Box for billing.',
              },
              address2: {
                displayName: 'Address Line 2',
                shortDesc: 'Secondary billing address line',
                longDesc: 'Additional billing address information like apartment or suite number.',
              },
              city: {
                displayName: 'City',
                shortDesc: 'Billing city',
                longDesc: 'The city for the billing address.',
              },
              province: {
                displayName: 'Province/State',
                shortDesc: 'Billing province or state',
                longDesc: 'The province, state, or region for the billing address.',
              },
              country: {
                displayName: 'Country',
                shortDesc: 'Billing country',
                longDesc: 'The country for the billing address.',
              },
              zip: {
                displayName: 'ZIP/Postal Code',
                shortDesc: 'Billing postal code',
                longDesc: 'The ZIP or postal code for the billing address.',
              },
              firstName: {
                displayName: 'First Name',
                shortDesc: 'Billing first name',
                longDesc: 'The first name of the billing contact.',
              },
              lastName: {
                displayName: 'Last Name',
                shortDesc: 'Billing last name',
                longDesc: 'The last name of the billing contact.',
              },
              company: {
                displayName: 'Company',
                shortDesc: 'Billing company name',
                longDesc: 'The company name associated with the billing address, if applicable.',
              },
              phone: {
                displayName: 'Phone',
                shortDesc: 'Billing contact phone',
                longDesc: 'The phone number for the billing contact.',
              },
            },
          },
        },
        useCustomerDefaultAddress: {
          displayName: 'Use Customer Default Address',
          shortDesc: 'Use customer’s default address',
          longDesc:
            'If true, uses the customer’s default shipping and billing address instead of custom ones.',
        },
        lineItems: {
          displayName: 'Line Items',
          shortDesc: 'Products in the draft order',
          longDesc:
            'A list of products or variants included in the draft order, with details like quantity and price.',
          type: {
            element_type: {
              fields: {
                variantId: {
                  displayName: 'Variant ID',
                  shortDesc: 'Product variant ID',
                  longDesc: 'The unique identifier of the product variant to include in the order.',
                },
                quantity: {
                  displayName: 'Quantity',
                  shortDesc: 'Number of items',
                  longDesc: 'The number of units of this variant to include in the draft order.',
                },
                title: {
                  displayName: 'Title',
                  shortDesc: 'Item title',
                  longDesc:
                    'The display name of the line item, typically the product or variant name.',
                },
                originalUnitPrice: {
                  displayName: 'Original Unit Price',
                  shortDesc: 'Price per unit',
                  longDesc: 'The original price per unit of the item before discounts.',
                },
                originalUnitPriceWithCurrency: {
                  displayName: 'Original Unit Price with Currency',
                  shortDesc: 'Price with currency details',
                  longDesc: 'The original unit price including currency specification.',
                  type: {
                    fields: {
                      amount: {
                        displayName: 'Amount',
                        shortDesc: 'Price amount',
                        longDesc: 'The numerical value of the unit price.',
                      },
                      currencyCode: {
                        displayName: 'Currency Code',
                        shortDesc: 'Currency code',
                        longDesc: 'The ISO 4217 currency code for the price, e.g., USD, EUR.',
                      },
                    },
                  },
                },
                sku: {
                  displayName: 'SKU',
                  shortDesc: 'Stock Keeping Unit',
                  longDesc: 'The stock keeping unit identifier for the product variant.',
                },
                requiresShipping: {
                  displayName: 'Requires Shipping',
                  shortDesc: 'Needs shipping',
                  longDesc: 'Indicates if the item requires physical shipping.',
                },
                taxable: {
                  displayName: 'Taxable',
                  shortDesc: 'Subject to tax',
                  longDesc: 'Specifies whether the item is taxable.',
                },
                weight: {
                  displayName: 'Weight',
                  shortDesc: 'Item weight',
                  longDesc: 'The weight of the item, used for shipping calculations.',
                  type: {
                    fields: {
                      value: {
                        displayName: 'Weight Value',
                        shortDesc: 'Numerical weight',
                        longDesc: 'The numerical value of the item’s weight.',
                      },
                      unit: {
                        displayName: 'Weight Unit',
                        shortDesc: 'Unit of weight',
                        longDesc: 'The unit of measurement for the weight, e.g., kg, lb.',
                      },
                    },
                  },
                },
                customAttributes: {
                  displayName: 'Custom Attributes',
                  shortDesc: 'Additional item attributes',
                  longDesc: 'Key-value pairs for adding custom metadata to the line item.',
                  type: {
                    element_type: {
                      fields: {
                        key: {
                          displayName: 'Key',
                          shortDesc: 'Attribute key',
                          longDesc: 'The identifier for the custom attribute.',
                        },
                        value: {
                          displayName: 'Value',
                          shortDesc: 'Attribute value',
                          longDesc: 'The value associated with the custom attribute key.',
                        },
                      },
                    },
                  },
                },
                appliedDiscount: {
                  displayName: 'Applied Discount',
                  shortDesc: 'Discount on item',
                  longDesc: 'Details of any discount applied to this specific line item.',
                  type: {
                    fields: {
                      title: {
                        displayName: 'Discount Title',
                        shortDesc: 'Discount name',
                        longDesc: 'The name or title of the discount.',
                      },
                      description: {
                        displayName: 'Discount Description',
                        shortDesc: 'Discount details',
                        longDesc: 'A description of the discount applied.',
                      },
                      value: {
                        displayName: 'Discount Value',
                        shortDesc: 'Discount amount or percentage',
                        longDesc:
                          'The numerical value of the discount, either as a fixed amount or percentage.',
                      },
                      valueType: {
                        displayName: 'Value Type',
                        shortDesc: 'Type of discount value',
                        longDesc:
                          'Specifies if the discount is a fixed amount or percentage (e.g., "FIXED_AMOUNT", "PERCENTAGE").',
                      },
                      amountWithCurrency: {
                        displayName: 'Amount with Currency',
                        shortDesc: 'Discount amount with currency',
                        longDesc: 'The discount amount including currency details.',
                        type: {
                          fields: {
                            amount: {
                              displayName: 'Amount',
                              shortDesc: 'Discount amount',
                              longDesc: 'The numerical value of the discount.',
                            },
                            currencyCode: {
                              displayName: 'Currency Code',
                              shortDesc: 'Discount currency',
                              longDesc: 'The ISO 4217 currency code for the discount amount.',
                            },
                          },
                        },
                      },
                    },
                  },
                },
                generatePriceOverride: {
                  displayName: 'Generate Price Override',
                  shortDesc: 'Override item price',
                  longDesc:
                    'If true, allows setting a custom price for the item instead of the original price.',
                },
                priceOverride: {
                  displayName: 'Price Override',
                  shortDesc: 'Custom item price',
                  longDesc: 'The custom price to override the original unit price.',
                  type: {
                    fields: {
                      amount: {
                        displayName: 'Amount',
                        shortDesc: 'Override amount',
                        longDesc: 'The numerical value of the custom price.',
                      },
                      currencyCode: {
                        displayName: 'Currency Code',
                        shortDesc: 'Override currency',
                        longDesc: 'The ISO 4217 currency code for the custom price.',
                      },
                    },
                  },
                },
                components: {
                  displayName: 'Components',
                  shortDesc: 'Bundle components',
                  longDesc: 'Details of components if the item is a bundle or composite product.',
                  type: {
                    element_type: {
                      fields: {
                        quantity: {
                          displayName: 'Quantity',
                          shortDesc: 'Component quantity',
                          longDesc: 'The number of units of this component in the bundle.',
                        },
                        variantId: {
                          displayName: 'Variant ID',
                          shortDesc: 'Component variant ID',
                          longDesc: 'The unique identifier of the variant included as a component.',
                        },
                      },
                    },
                  },
                },
                uuid: {
                  displayName: 'UUID',
                  shortDesc: 'Unique identifier',
                  longDesc:
                    'A unique identifier for the line item, often used for tracking or external systems.',
                },
              },
            },
          },
        },
        appliedDiscount: {
          displayName: 'Applied Discount',
          shortDesc: 'Order-wide discount',
          longDesc: 'Details of a discount applied to the entire draft order.',
          type: {
            fields: {
              title: {
                displayName: 'Discount Title',
                shortDesc: 'Discount name',
                longDesc: 'The name or title of the order-wide discount.',
              },
              description: {
                displayName: 'Discount Description',
                shortDesc: 'Discount details',
                longDesc: 'A description of the order-wide discount.',
              },
              value: {
                displayName: 'Discount Value',
                shortDesc: 'Discount amount or percentage',
                longDesc:
                  'The numerical value of the discount, either as a fixed amount or percentage.',
              },
              valueType: {
                displayName: 'Value Type',
                shortDesc: 'Type of discount value',
                longDesc:
                  'Specifies if the discount is a fixed amount or percentage (e.g., "FIXED_AMOUNT", "PERCENTAGE").',
              },
              amountWithCurrency: {
                displayName: 'Amount with Currency',
                shortDesc: 'Discount amount with currency',
                longDesc: 'The discount amount including currency details.',
                type: {
                  fields: {
                    amount: {
                      displayName: 'Amount',
                      shortDesc: 'Discount amount',
                      longDesc: 'The numerical value of the discount.',
                    },
                    currencyCode: {
                      displayName: 'Currency Code',
                      shortDesc: 'Discount currency',
                      longDesc: 'The ISO 4217 currency code for the discount amount.',
                    },
                  },
                },
              },
            },
          },
        },
        shippingLine: {
          displayName: 'Shipping Line',
          shortDesc: 'Shipping details',
          longDesc: 'Details about the shipping method and cost for the draft order.',
          type: {
            fields: {
              price: {
                displayName: 'Price',
                shortDesc: 'Shipping cost',
                longDesc: 'The cost of shipping as a numerical value.',
              },
              priceWithCurrency: {
                displayName: 'Price with Currency',
                shortDesc: 'Shipping cost with currency',
                longDesc: 'The shipping cost including currency specification.',
                type: {
                  fields: {
                    amount: {
                      displayName: 'Amount',
                      shortDesc: 'Shipping amount',
                      longDesc: 'The numerical value of the shipping cost.',
                    },
                    currencyCode: {
                      displayName: 'Currency Code',
                      shortDesc: 'Shipping currency',
                      longDesc: 'The ISO 4217 currency code for the shipping cost.',
                    },
                  },
                },
              },
              title: {
                displayName: 'Title',
                shortDesc: 'Shipping method name',
                longDesc: 'The name of the shipping method, e.g., "Standard Shipping".',
              },
              shippingRateHandle: {
                displayName: 'Shipping Rate Handle',
                shortDesc: 'Shipping rate identifier',
                longDesc:
                  'A unique identifier for the shipping rate, often tied to a predefined rate in Shopify.',
              },
            },
          },
        },
        customAttributes: {
          displayName: 'Custom Attributes',
          shortDesc: 'Order custom attributes',
          longDesc: 'Key-value pairs for adding custom metadata to the draft order.',
          type: {
            element_type: {
              fields: {
                key: {
                  displayName: 'Key',
                  shortDesc: 'Attribute key',
                  longDesc: 'The identifier for the custom attribute.',
                },
                value: {
                  displayName: 'Value',
                  shortDesc: 'Attribute value',
                  longDesc: 'The value associated with the custom attribute key.',
                },
              },
            },
          },
        },
        allowDiscountCodesInCheckout: {
          displayName: 'Allow Discount Codes in Checkout',
          shortDesc: 'Enable discount codes',
          longDesc:
            'If true, allows customers to apply discount codes during checkout from this draft order.',
        },
        acceptAutomaticDiscounts: {
          displayName: 'Accept Automatic Discounts',
          shortDesc: 'Apply automatic discounts',
          longDesc:
            'If true, automatically applies any eligible store-wide discounts to the draft order.',
        },
        discountCodes: {
          displayName: 'Discount Codes',
          shortDesc: 'List of discount codes',
          longDesc: 'A list of discount codes to apply to the draft order.',
          type: {
            element_type: {
              displayName: 'Discount Code',
              shortDesc: 'Single discount code',
              longDesc: 'A specific discount code to apply to the order.',
            },
          },
        },
        metafields: {
          displayName: 'Metafields',
          shortDesc: 'Custom metadata',
          longDesc:
            'Additional metadata fields for the draft order, useful for custom integrations.',
          type: {
            element_type: {
              fields: {
                namespace: {
                  displayName: 'Namespace',
                  shortDesc: 'Metafield namespace',
                  longDesc: 'A grouping identifier for the metafield.',
                },
                key: {
                  displayName: 'Key',
                  shortDesc: 'Metafield key',
                  longDesc: 'The specific identifier for the metafield.',
                },
                value: {
                  displayName: 'Value',
                  shortDesc: 'Metafield value',
                  longDesc: 'The value stored in the metafield.',
                },
                type: {
                  displayName: 'Type',
                  shortDesc: 'Metafield data type',
                  longDesc: 'The data type of the metafield value, e.g., string, integer, JSON.',
                },
              },
            },
          },
        },
        localizedFields: {
          displayName: 'Localized Fields',
          shortDesc: 'Localized content',
          longDesc: 'Fields that support localized content for different regions or languages.',
          type: {
            element_type: {
              fields: {
                value: {
                  displayName: 'Value',
                  shortDesc: 'Localized value',
                  longDesc: 'The localized content value.',
                },
                key: {
                  displayName: 'Key',
                  shortDesc: 'Localized field key',
                  longDesc: 'The identifier for the localized field.',
                },
                locale: {
                  displayName: 'Locale',
                  shortDesc: 'Language/region code',
                  longDesc: 'The locale code for the localized content, e.g., "en-US", "fr-CA".',
                },
              },
            },
          },
        },
        presentmentCurrencyCode: {
          displayName: 'Presentment Currency Code',
          shortDesc: 'Display currency',
          longDesc:
            'The ISO 4217 currency code for displaying prices to the customer, e.g., USD, CAD.',
        },
        poNumber: {
          displayName: 'PO Number',
          shortDesc: 'Purchase order number',
          longDesc:
            'The purchase order number associated with the draft order, often used for B2B transactions.',
        },
        paymentTerms: {
          displayName: 'Payment Terms',
          shortDesc: 'Payment conditions',
          longDesc:
            'Defines the payment terms for the draft order, such as due dates or schedules.',
          type: {
            fields: {
              paymentTermsTemplateId: {
                displayName: 'Payment Terms Template ID',
                shortDesc: 'Template identifier',
                longDesc: 'The ID of a predefined payment terms template in Shopify.',
              },
              paymentSchedules: {
                displayName: 'Payment Schedules',
                shortDesc: 'Payment due dates',
                longDesc: 'A list of scheduled payments with due dates and amounts.',
                type: {
                  element_type: {
                    fields: {
                      dueAt: {
                        displayName: 'Due At',
                        shortDesc: 'Due date',
                        longDesc: 'The date when the payment is due.',
                      },
                      amount: {
                        displayName: 'Amount',
                        shortDesc: 'Payment amount',
                        longDesc: 'The numerical value of the payment due.',
                      },
                      currencyCode: {
                        displayName: 'Currency Code',
                        shortDesc: 'Payment currency',
                        longDesc: 'The ISO 4217 currency code for the payment amount.',
                      },
                      issuedAt: {
                        displayName: 'Issued At',
                        shortDesc: 'Issue date',
                        longDesc: 'The date when the payment schedule was issued.',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        purchasingEntity: {
          displayName: 'Purchasing Entity',
          shortDesc: 'Buyer details',
          longDesc:
            'Details about the entity making the purchase, such as a company or individual.',
          type: {
            fields: {
              customerId: {
                displayName: 'Customer ID',
                shortDesc: 'Purchaser customer ID',
                longDesc: 'The ID of the customer making the purchase.',
              },
              companyId: {
                displayName: 'Company ID',
                shortDesc: 'Purchaser company ID',
                longDesc: 'The ID of the company making the purchase.',
              },
              companyLocationId: {
                displayName: 'Company Location ID',
                shortDesc: 'Company location ID',
                longDesc: 'The ID of the specific company location making the purchase.',
              },
              companyContactId: {
                displayName: 'Company Contact ID',
                shortDesc: 'Contact ID',
                longDesc: 'The ID of the company contact responsible for the purchase.',
              },
            },
          },
        },
        reserveInventoryUntil: {
          displayName: 'Reserve Inventory Until',
          shortDesc: 'Inventory reservation deadline',
          longDesc: 'The date and time until which the inventory is reserved for this draft order.',
        },
        sourceName: {
          displayName: 'Source Name',
          shortDesc: 'Order source',
          longDesc: 'The source of the draft order, e.g., "web", "manual", or an app name.',
        },
        visibleToCustomer: {
          displayName: 'Visible to Customer',
          shortDesc: 'Customer visibility',
          longDesc: 'If true, the draft order is visible to the customer, e.g., in their account.',
        },
      },
    },
    'create-customer': {
      displayName: 'Create Customer',
      shortDesc: 'Creates a new customer in Shopify',
      longDesc:
        'Adds a new customer to the Shopify store, allowing you to store their contact information, addresses, and marketing preferences for future orders and engagement.',
      options: {
        email: {
          displayName: 'Email',
          shortDesc: 'Customer email address',
          longDesc:
            'The primary email address of the customer, used for account creation, notifications, and marketing.',
        },
        phone: {
          displayName: 'Phone',
          shortDesc: 'Customer phone number',
          longDesc:
            'The customer’s phone number, useful for contact purposes and SMS marketing if consented.',
        },
        firstName: {
          displayName: 'First Name',
          shortDesc: 'Customer first name',
          longDesc: 'The first name of the customer, used for personalization and address details.',
        },
        lastName: {
          displayName: 'Last Name',
          shortDesc: 'Customer last name',
          longDesc:
            'The last name of the customer, completing their full name for identification and shipping.',
        },
        locale: {
          displayName: 'Locale',
          shortDesc: 'Customer language/region',
          longDesc:
            'The preferred language and region code for the customer, e.g., "en-US" or "fr-CA", affecting communication and formatting.',
        },
        note: {
          displayName: 'Note',
          shortDesc: 'Notes about the customer',
          longDesc:
            'Internal notes about the customer, such as preferences, special instructions, or account details.',
        },
        taxExempt: {
          displayName: 'Tax Exempt',
          shortDesc: 'Exempt customer from taxes',
          longDesc:
            'Indicates whether the customer is exempt from taxes on all purchases. Set to true for tax-exempt entities.',
        },
        taxExemptions: {
          displayName: 'Tax Exemptions',
          shortDesc: 'Specific tax exemptions',
          longDesc:
            'A list of specific tax exemptions applied to the customer, such as regional or category-specific exemptions.',
          type: {
            element_type: {
              displayName: 'Tax Exemption Type',
              shortDesc: 'Type of tax exemption',
              longDesc: 'Defines the specific tax exemption applied, e.g., GST, VAT, or sales tax.',
            },
          },
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Customer tags',
          longDesc:
            'A list of tags to categorize or filter the customer, e.g., "VIP", "wholesale", "new".',
          type: {
            element_type: {
              displayName: 'Tag',
              shortDesc: 'Single tag value',
              longDesc:
                'A single string value used to tag the customer for organization or segmentation.',
            },
          },
        },
        addresses: {
          displayName: 'Addresses',
          shortDesc: 'Customer addresses',
          longDesc:
            'A list of addresses associated with the customer, such as shipping or billing addresses.',
          type: {
            element_type: {
              fields: {
                address1: {
                  displayName: 'Address Line 1',
                  shortDesc: 'Primary address line',
                  longDesc: 'The street address or PO Box for the customer.',
                },
                address2: {
                  displayName: 'Address Line 2',
                  shortDesc: 'Secondary address line',
                  longDesc: 'Additional address information like apartment or suite number.',
                },
                city: {
                  displayName: 'City',
                  shortDesc: 'Customer city',
                  longDesc: 'The city associated with the customer’s address.',
                },
                province: {
                  displayName: 'Province/State',
                  shortDesc: 'Customer province or state',
                  longDesc: 'The province, state, or region for the customer’s address.',
                },
                country: {
                  displayName: 'Country',
                  shortDesc: 'Customer country',
                  longDesc: 'The country for the customer’s address.',
                },
                zip: {
                  displayName: 'ZIP/Postal Code',
                  shortDesc: 'Customer postal code',
                  longDesc: 'The ZIP or postal code for the customer’s address.',
                },
                firstName: {
                  displayName: 'First Name',
                  shortDesc: 'Address first name',
                  longDesc: 'The first name associated with this specific address.',
                },
                lastName: {
                  displayName: 'Last Name',
                  shortDesc: 'Address last name',
                  longDesc: 'The last name associated with this specific address.',
                },
                company: {
                  displayName: 'Company',
                  shortDesc: 'Address company name',
                  longDesc: 'The company name tied to this address, if applicable.',
                },
                phone: {
                  displayName: 'Phone',
                  shortDesc: 'Address phone number',
                  longDesc: 'The phone number linked to this specific address.',
                },
              },
            },
          },
        },
        emailMarketingConsent: {
          displayName: 'Email Marketing Consent',
          shortDesc: 'Email marketing preferences',
          longDesc:
            'Details about the customer’s consent to receive email marketing communications.',
          type: {
            fields: {
              marketingState: {
                displayName: 'Marketing State',
                shortDesc: 'Consent status',
                longDesc:
                  'The current state of email marketing consent, e.g., "SUBSCRIBED", "UNSUBSCRIBED", or "PENDING".',
              },
              marketingOptInLevel: {
                displayName: 'Marketing Opt-In Level',
                shortDesc: 'Opt-in level',
                longDesc:
                  'The level of consent provided, e.g., "SINGLE_OPT_IN" or "CONFIRMED_OPT_IN", based on how consent was obtained.',
              },
            },
          },
        },
        smsMarketingConsent: {
          displayName: 'SMS Marketing Consent',
          shortDesc: 'SMS marketing preferences',
          longDesc: 'Details about the customer’s consent to receive SMS marketing messages.',
          type: {
            fields: {
              marketingState: {
                displayName: 'Marketing State',
                shortDesc: 'Consent status',
                longDesc:
                  'The current state of SMS marketing consent, e.g., "SUBSCRIBED", "UNSUBSCRIBED", or "PENDING".',
              },
              marketingOptInLevel: {
                displayName: 'Marketing Opt-In Level',
                shortDesc: 'Opt-in level',
                longDesc:
                  'The level of consent provided for SMS, e.g., "SINGLE_OPT_IN" or "CONFIRMED_OPT_IN".',
              },
            },
          },
        },
        metafields: {
          displayName: 'Metafields',
          shortDesc: 'Custom metadata',
          longDesc:
            'Additional metadata fields for the customer, useful for custom integrations or data storage.',
          type: {
            element_type: {
              fields: {
                namespace: {
                  displayName: 'Namespace',
                  shortDesc: 'Metafield namespace',
                  longDesc: 'A grouping identifier for the metafield to organize related data.',
                },
                key: {
                  displayName: 'Key',
                  shortDesc: 'Metafield key',
                  longDesc: 'The specific identifier for the metafield.',
                },
                value: {
                  displayName: 'Value',
                  shortDesc: 'Metafield value',
                  longDesc:
                    'The value stored in the metafield, which can be a string, number, or JSON.',
                },
                type: {
                  displayName: 'Type',
                  shortDesc: 'Metafield data type',
                  longDesc:
                    'The data type of the metafield value, e.g., "string", "integer", "json".',
                },
              },
            },
          },
        },
      },
    },
    'create-blog-entry': {
      displayName: 'Create Blog Entry',
      shortDesc: 'Creates a new blog post in Shopify',
      longDesc:
        'Adds a new blog post to a specified blog in your Shopify store, allowing you to publish content such as articles, news, or updates for customers.',
      options: {
        blogId: {
          displayName: 'Blog ID',
          shortDesc: 'ID of the target blog',
          longDesc:
            'The unique identifier of the blog where the new entry will be created. Required to associate the post with a specific blog.',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'Blog post title',
          longDesc: 'The headline or title of the blog post, displayed prominently to readers.',
        },
        content: {
          displayName: 'Content',
          shortDesc: 'Blog post content',
          longDesc:
            'The main body of the blog post, which can include text, HTML, or other formatted content to convey the message or story.',
        },
        author: {
          displayName: 'Author',
          shortDesc: 'Author of the blog post',
          longDesc:
            'The name of the person or entity credited with writing the blog post, displayed as the author.',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Tags for the blog post',
          longDesc:
            'A list of keywords or categories to tag the blog post, aiding in searchability and organization.',
          type: {
            element_type: {
              displayName: 'Tag',
              shortDesc: 'Single tag value',
              longDesc:
                'A single string value used to tag the blog post, e.g., "news", "tutorial", "promotion".',
            },
          },
        },
        summary: {
          displayName: 'Summary',
          shortDesc: 'Blog post summary',
          longDesc:
            'A brief overview or excerpt of the blog post, often used as a teaser or preview in blog listings.',
        },
        published: {
          displayName: 'Published',
          shortDesc: 'Publication status',
          longDesc:
            'Indicates whether the blog post is published (true) or saved as a draft (false) upon creation.',
        },
        image: {
          displayName: 'Image',
          shortDesc: 'Featured image for the post',
          longDesc:
            'The primary image associated with the blog post, used for visual appeal in previews or headers.',
          type: {
            fields: {
              altText: {
                displayName: 'Alt Text',
                shortDesc: 'Image alt text',
                longDesc:
                  'Descriptive text for the image, used for accessibility and SEO purposes.',
              },
              url: {
                displayName: 'URL',
                shortDesc: 'Image URL',
                longDesc:
                  'The web address or source location of the image file to be used in the blog post.',
              },
            },
          },
        },
      },
    },
    'add-tag-to-customer': {
      displayName: 'Add Tag to Customer',
      shortDesc: 'Adds tags to an existing customer',
      longDesc:
        'Appends or replaces tags for a specified customer in Shopify, useful for categorization, segmentation, or tracking purposes.',
      options: {
        customerId: {
          displayName: 'Customer ID',
          shortDesc: 'ID of the customer',
          longDesc:
            'The unique identifier of the customer to whom tags will be added. Required to target the correct customer.',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Tags to add',
          longDesc:
            'A list of tags to apply to the customer, such as "VIP", "loyal", or "newsletter". Can be appended or replace existing tags based on the append option.',
        },
        append: {
          displayName: 'Append',
          shortDesc: 'Append or replace tags',
          longDesc:
            'If true, adds the new tags to the existing ones; if false, replaces all existing tags with the new ones.',
        },
      },
    },
    'create-transaction': {
      displayName: 'Create Transaction',
      shortDesc: 'Creates a transaction for an order',
      longDesc:
        'Records a financial transaction (e.g., payment, refund) for a specific order in Shopify, linked to a payment gateway.',
      options: {
        orderId: {
          displayName: 'Order ID',
          shortDesc: 'ID of the order',
          longDesc:
            'The unique identifier of the order to which this transaction applies. Required to associate the transaction correctly.',
        },
        amount: {
          displayName: 'Amount',
          shortDesc: 'Transaction amount',
          longDesc: 'The numerical value of the transaction, such as the amount paid or refunded.',
        },
        currency: {
          displayName: 'Currency',
          shortDesc: 'Transaction currency',
          longDesc: 'The ISO 4217 currency code for the transaction amount, e.g., "USD", "EUR".',
        },
        type: {
          displayName: 'Type',
          shortDesc: 'Transaction type',
          longDesc:
            'The type of transaction, such as "authorization", "capture", "sale", or "refund". Defines the transaction’s purpose.',
        },
        parentTransactionId: {
          displayName: 'Parent Transaction ID',
          shortDesc: 'ID of parent transaction',
          longDesc:
            'The ID of a previous transaction this one relates to, e.g., for refunds or captures linked to an authorization.',
        },
        gateway: {
          displayName: 'Gateway',
          shortDesc: 'Payment gateway',
          longDesc:
            'The payment gateway used for the transaction, e.g., "shopify_payments", "paypal", or a custom gateway name.',
        },
        finalCapture: {
          displayName: 'Final Capture',
          shortDesc: 'Complete capture flag',
          longDesc:
            'If true, indicates this is the final capture of funds for an authorization; if false, partial captures may follow.',
        },
      },
    },
    'create-company': {
      displayName: 'Create Company',
      shortDesc: 'Creates a new company in Shopify',
      longDesc:
        'Adds a new company entity to Shopify, typically for B2B purposes, including contact and location details for wholesale or enterprise customers.',
      options: {
        companyName: {
          displayName: 'Name',
          shortDesc: 'Company name',
          longDesc:
            'The official name of the company, used for identification and display purposes.',
        },
        externalId: {
          displayName: 'External ID',
          shortDesc: 'External identifier',
          longDesc:
            'A unique identifier from an external system, useful for syncing or referencing the company outside Shopify.',
        },
        note: {
          displayName: 'Note',
          shortDesc: 'Company notes',
          longDesc:
            'Internal notes about the company, such as account details or special instructions.',
        },
        customerSince: {
          displayName: 'Customer Since',
          shortDesc: 'Start date',
          longDesc:
            'The date the company became a customer, formatted as a timestamp, useful for tracking tenure.',
        },
        contactProperties: {
          displayName: 'Contact Properties',
          shortDesc: 'Primary contact details',
          longDesc: 'Details about the primary contact person for the company.',
          type: {
            fields: {
              firstName: {
                displayName: 'First Name',
                shortDesc: 'Contact first name',
                longDesc: 'The first name of the company’s primary contact.',
              },
              lastName: {
                displayName: 'Last Name',
                shortDesc: 'Contact last name',
                longDesc: 'The last name of the company’s primary contact.',
              },
              email: {
                displayName: 'Email',
                shortDesc: 'Contact email',
                longDesc: 'The email address of the primary contact, used for communication.',
              },
              phone: {
                displayName: 'Phone',
                shortDesc: 'Contact phone',
                longDesc: 'The phone number of the primary contact.',
              },
              title: {
                displayName: 'Title',
                shortDesc: 'Contact job title',
                longDesc: 'The job title or role of the primary contact within the company.',
              },
              locale: {
                displayName: 'Locale',
                shortDesc: 'Contact language/region',
                longDesc: 'The preferred language and region code for the contact, e.g., "en-US".',
              },
            },
          },
        },
        locationProperties: {
          displayName: 'Location Properties',
          shortDesc: 'Company location details',
          longDesc:
            'Details about the company’s physical location, including shipping and billing addresses.',
          type: {
            fields: {
              locationName: {
                displayName: 'Location Name',
                shortDesc: 'Name of location',
                longDesc: 'A descriptive name for this company location, e.g., "Headquarters".',
              },
              phone: {
                displayName: 'Phone',
                shortDesc: 'Location phone',
                longDesc: 'The phone number associated with this company location.',
              },
              note: {
                displayName: 'Note',
                shortDesc: 'Location notes',
                longDesc: 'Internal notes about this location, such as delivery instructions.',
              },
              externalId: {
                displayName: 'External ID',
                shortDesc: 'Location external ID',
                longDesc:
                  'An external identifier for this location, useful for integration with other systems.',
              },
              taxExempt: {
                displayName: 'Tax Exempt',
                shortDesc: 'Tax exemption status',
                longDesc: 'Indicates if this location is exempt from taxes.',
              },
              taxRegistrationId: {
                displayName: 'Tax Registration ID',
                shortDesc: 'Tax ID',
                longDesc: 'The tax registration number for this location, e.g., VAT or EIN.',
              },
              taxExemptions: {
                displayName: 'Tax Exemptions',
                shortDesc: 'Specific tax exemptions',
                longDesc: 'A list of specific tax exemptions applied to this location.',
                type: {
                  element_type: {
                    displayName: 'Tax Exemption Type',
                    shortDesc: 'Type of exemption',
                    longDesc: 'Defines the specific tax exemption, e.g., "GST", "VAT".',
                  },
                },
              },
              locale: {
                displayName: 'Locale',
                shortDesc: 'Location language/region',
                longDesc:
                  'The preferred language and region code for this location, e.g., "en-CA".',
              },
              shippingAddress: {
                displayName: 'Shipping Address',
                shortDesc: 'Shipping address',
                longDesc: 'The address where goods are shipped for this company location.',
                type: {
                  fields: {
                    address1: {
                      displayName: 'Address Line 1',
                      shortDesc: 'Primary shipping line',
                      longDesc: 'The street address or PO Box for shipping.',
                    },
                    address2: {
                      displayName: 'Address Line 2',
                      shortDesc: 'Secondary shipping line',
                      longDesc: 'Additional shipping address details, e.g., suite number.',
                    },
                    city: {
                      displayName: 'City',
                      shortDesc: 'Shipping city',
                      longDesc: 'The city for the shipping address.',
                    },
                    zoneCode: {
                      displayName: 'Zone Code',
                      shortDesc: 'Province/state code',
                      longDesc: 'The code for the province or state, e.g., "CA" for California.',
                    },
                    countryCode: {
                      displayName: 'Country Code',
                      shortDesc: 'Country code',
                      longDesc: 'The ISO 3166-1 alpha-2 country code, e.g., "US".',
                    },
                    zip: {
                      displayName: 'ZIP/Postal Code',
                      shortDesc: 'Shipping postal code',
                      longDesc: 'The ZIP or postal code for the shipping address.',
                    },
                  },
                },
              },
              billingSameAsShipping: {
                displayName: 'Billing Same as Shipping',
                shortDesc: 'Use shipping for billing',
                longDesc: 'If true, the shipping address is also used as the billing address.',
              },
              billingAddress: {
                displayName: 'Billing Address',
                shortDesc: 'Billing address',
                longDesc: 'The address used for billing purposes, if different from shipping.',
                type: {
                  fields: {
                    address1: {
                      displayName: 'Address Line 1',
                      shortDesc: 'Primary billing line',
                      longDesc: 'The street address or PO Box for billing.',
                    },
                    address2: {
                      displayName: 'Address Line 2',
                      shortDesc: 'Secondary billing line',
                      longDesc: 'Additional billing address details, e.g., apartment number.',
                    },
                    city: {
                      displayName: 'City',
                      shortDesc: 'Billing city',
                      longDesc: 'The city for the billing address.',
                    },
                    zoneCode: {
                      displayName: 'Zone Code',
                      shortDesc: 'Province/state code',
                      longDesc: 'The code for the province or state, e.g., "NY".',
                    },
                    countryCode: {
                      displayName: 'Country Code',
                      shortDesc: 'Country code',
                      longDesc: 'The ISO 3166-1 alpha-2 country code, e.g., "CA".',
                    },
                    zip: {
                      displayName: 'ZIP/Postal Code',
                      shortDesc: 'Billing postal code',
                      longDesc: 'The ZIP or postal code for the billing address.',
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
  triggers: {
    'shopify-abandoned-cart-trigger': {
      displayName: 'Shopify New Abandoned Cart',
      shortDesc: 'Triggers when a customer abandons a checkout in Shopify',
      longDesc:
        'This trigger activates when a Shopify checkout is created but not completed within the specified time window. Use this to send recovery emails, offer discounts, or analyze cart abandonment patterns.',
      options: {
        abandonedHours: {
          displayName: 'Abandoned Hours',
          shortDesc: 'Time window to consider a cart abandoned',
          longDesc:
            'Specify how many hours must pass since cart creation without completion for it to be considered abandoned. Values range from 1 hour to 168 hours (one week).',
        },
      },
    },
    'shopify-blog-trigger': {
      displayName: 'Shopify Blog Created',
      shortDesc: 'Triggers when a new blog is created in Shopify',
      longDesc:
        'This trigger activates whenever a new blog (not an article) is created in your Shopify store. Use this to monitor blog creation or automate follow-up tasks.',
    },
    'shopify-blog-entry-trigger': {
      displayName: 'Shopify New Blog Article',
      shortDesc: 'Triggers when a blog article is created or published',
      longDesc:
        'This trigger activates when a new article is created or published in a specified Shopify blog. Use this to automate social media sharing, email notifications, or content distribution workflows.',
      options: {
        blogId: {
          displayName: 'Blog',
          shortDesc: 'Select the blog to monitor',
          longDesc: 'Choose which Shopify blog to monitor for new articles.',
        },
        entryStatus: {
          displayName: 'Article Status',
          shortDesc: 'Filter articles by publication status',
          longDesc:
            'Choose whether to trigger on all articles, only published articles, or only draft articles.',
        },
      },
    },
    'shopify-customer-created-trigger': {
      displayName: 'Shopify Customer Created',
      shortDesc: 'Triggers when a new customer account is created',
      longDesc:
        'This trigger activates whenever a new customer registers or is created in your Shopify store. Use this to send welcome emails, add customers to marketing lists, or create records in other systems.',
    },
    'shopify-customer-updated-trigger': {
      displayName: 'Shopify Customer Updated',
      shortDesc: 'Triggers when customer information is modified',
      longDesc:
        'This trigger activates whenever customer information is updated in your Shopify store. Use this to sync customer data with other systems, track specific customer changes, or update marketing preferences.',
    },
    'shopify-new-order-trigger': {
      displayName: 'Shopify New Order',
      shortDesc: 'Triggers when a new order is placed with the specified status',
      longDesc:
        'This trigger activates when a new order is created in your Shopify store that matches the specified status filter. Use this to process orders, update inventory in other systems, or send custom notifications based on order status.',
      options: {
        orderStatus: {
          displayName: 'Order Status',
          shortDesc: 'Filter orders by their status',
          longDesc:
            'Select which type of orders to monitor based on their status (e.g., any, paid, fulfilled, cancelled). This lets you create different workflows for different order conditions.',
        },
      },
    },
  },
};

export default ShopifyAppEn;
