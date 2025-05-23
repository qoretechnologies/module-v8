/* eslint-disable max-len */

import { MagentoSearchOptionsEn } from './search-options';

const MagentoAppEn = {
  displayName: 'Magento',
  shortDesc:
    'E-commerce platform for building online stores and managing customers, products, and orders',
  longDesc:
    'Magento is a flexible e-commerce platform that provides businesses with a complete solution for building and managing online stores. This integration allows you to automate workflows when customer, product, order, invoice, or shipment events occur in your Magento store.',
  actions: {
    customerCustomerRepositoryV1GetByIdGet: {
      displayName: 'Get Customer by ID',
      shortDesc: 'Retrieve a specific customer account by ID',
      longDesc:
        'Retrieves detailed information about a customer account using the customer ID. Returns all customer attributes including address information, account status, and custom attributes.',
    },
    customerCustomerRepositoryV1SavePut: {
      displayName: 'Update Customer',
      shortDesc: 'Update an existing customer account',
      longDesc:
        'Updates customer information for an existing account. This endpoint allows modification of personal information, addresses, custom attributes, and other account details. The customer ID must be included in the request.',
    },
    customerCustomerRepositoryV1DeleteByIdDelete: {
      displayName: 'Delete Customer',
      shortDesc: 'Remove a customer account by ID',
      longDesc:
        'Permanently deletes a customer account from the system. This operation cannot be undone and will remove all customer data associated with the specified ID, including addresses and order history references.',
    },
    customerCustomerRepositoryV1GetListGet: {
      displayName: 'List Customers',
      shortDesc: 'Retrieve a list of customer accounts',
      longDesc:
        'Returns a list of customer accounts that match specified search criteria. Results can be filtered, sorted, and paginated. Use search criteria parameters to narrow results by email, name, creation date, or other customer attributes.',
      options: MagentoSearchOptionsEn,
    },
    customerAccountManagementV1CreateAccountPost: {
      displayName: 'Create Customer Account',
      shortDesc: 'Register a new customer account',
      longDesc:
        'Creates a new customer account with the provided information. Required fields include email, password, and first/last name. Optional details include addresses, date of birth, and custom attributes. Returns the newly created customer ID upon success.',
    },
    catalogProductRepositoryV1SavePost: {
      displayName: 'Create Product',
      shortDesc: 'Add a new product to the catalog',
      longDesc:
        'Creates a new product in the catalog with specified attributes, pricing, and inventory information. Products can be simple, configurable, bundled, grouped, virtual, or downloadable. Media gallery entries, tier prices, and custom options can also be defined.',
    },
    catalogProductRepositoryV1GetListGet: {
      displayName: 'List Products',
      shortDesc: 'Retrieve a list of products from the catalog',
      longDesc:
        'Returns a collection of products that match the specified search criteria. Results can be filtered by attributes like name, SKU, price, and status. Supports pagination, sorting, and inclusion of custom attributes in the response.',
      options: MagentoSearchOptionsEn,
    },
    catalogProductRepositoryV1SavePut: {
      displayName: 'Update Product',
      shortDesc: 'Modify an existing product',
      longDesc:
        'Updates an existing product in the catalog. Can modify any product attribute including name, price, description, images, inventory, and category assignments. The product SKU or ID must be specified in the request.',
      options: {
        sku: {
          displayName: 'Product SKU',
          shortDesc: 'Stock Keeping Unit identifier for the product',
          longDesc:
            'A unique alphanumeric identifier assigned to a product for inventory tracking and management purposes. The SKU helps in identifying specific product variations including size, color, and other attributes.',
        },
      },
    },
    catalogProductRepositoryV1DeleteByIdDelete: {
      displayName: 'Delete Product',
      shortDesc: 'Remove a product from the catalog',
      longDesc:
        'Permanently removes a product from the catalog by ID or SKU. This operation cannot be undone and may affect existing orders and carts that reference the deleted product.',
      options: {
        sku: {
          displayName: 'Product SKU',
          shortDesc: 'Stock Keeping Unit identifier for the product',
          longDesc:
            'A unique alphanumeric identifier assigned to a product for inventory tracking and management purposes. The SKU helps in identifying specific product variations including size, color, and other attributes.',
        },
      },
    },
    catalogProductRepositoryV1GetGet: {
      displayName: 'Get Product Details',
      shortDesc: 'Retrieve detailed information about a specific product',
      longDesc:
        'Retrieves comprehensive information about a specific product by SKU or ID. The response includes all product attributes, images, pricing information, inventory status, and category assignments. Additional parameters can control which data is included.',
      options: {
        sku: {
          displayName: 'Product SKU',
          shortDesc: 'Stock Keeping Unit identifier for the product',
          longDesc:
            'A unique alphanumeric identifier assigned to a product for inventory tracking and management purposes. The SKU helps in identifying specific product variations including size, color, and other attributes.',
        },
      },
    },
    quoteCartRepositoryV1GetListGet: {
      displayName: 'List Shopping Carts',
      shortDesc: 'Retrieve a list of active shopping carts',
      longDesc:
        'Returns a collection of active shopping carts that match the specified search criteria. Results can be filtered by customer ID, creation date, and cart status. Each cart includes items, applied coupons, and shipping/billing information if available.',
      options: MagentoSearchOptionsEn,
    },
    salesOrderRepositoryV1GetGet: {
      displayName: 'Get Order Details',
      shortDesc: 'Retrieve detailed information about a specific order',
      longDesc:
        'Retrieves comprehensive information about a specific order by ID. Includes order items, billing and shipping addresses, payment information, applied discounts, and order status history. Useful for order processing and customer service inquiries.',
    },
    salesOrderRepositoryV1GetListGet: {
      displayName: 'List Orders',
      shortDesc: 'Retrieve a list of orders based on search criteria',
      longDesc:
        'Returns a collection of orders that match the specified search criteria. Results can be filtered by customer, status, date range, and total amount. Supports pagination and sorting to efficiently browse large order volumes.',
      options: MagentoSearchOptionsEn,
    },
    salesShipmentRepositoryV1SavePost: {
      displayName: 'Create Shipment',
      shortDesc: 'Creates a new shipment for an order',
      longDesc:
        'Creates a new shipment record for an existing order, allowing you to document and track the physical sending of order items to the customer. Includes options for specifying tracking numbers, shipping carriers, and shipped items with their quantities.',
    },
    salesInvoiceRepositoryV1SavePost: {
      displayName: 'Create Invoice',
      shortDesc: 'Creates a new invoice for an order',
      longDesc:
        "Creates a new invoice record for an existing order, documenting the financial transaction and payment request. Allows for specifying line items to be invoiced, payment details, and comments that will appear on the customer's invoice.",
    },
    salesOrderRepositoryV1SavePut: {
      displayName: 'Create Order',
      shortDesc: 'Persists order information to the system',
      longDesc:
        'Performs persist operations for a specified order. Saves the order data to the database, including customer information, line items, payment details, shipping information, and other relevant order metadata.',
    },
    salesOrderManagementV1AddCommentPost: {
      displayName: 'Add Order Comment',
      shortDesc: 'Append a comment to an existing order',
      longDesc:
        'Adds a comment to the order history. Comments can be internal (visible only to administrators) or customer-visible. Each comment is timestamped and attributed to the author. Useful for documenting order processing steps and customer communications.',
      options: {
        id: {
          displayName: 'Order ID',
          shortDesc: 'The ID of the order to which the comment will be added',
          longDesc: 'The ID of the order to which the comment will be added',
        },
      },
    },
    salesOrderManagementV1GetCommentsListGet: {
      displayName: 'Get Order Comments',
      shortDesc: 'Retrieve the comment history for an order',
      longDesc:
        'Returns the complete comment history for a specific order. Results include comment text, timestamp, author information, and visibility status (customer-visible or admin-only). Comments are returned in chronological order.',
    },
    salesInvoiceRepositoryV1GetListGet: {
      displayName: 'List Invoices',
      shortDesc: 'Retrieve a collection of invoices',
      longDesc:
        'Returns a list of invoices based on specified search criteria. Results can be filtered by order ID, customer, date, and amount. Each invoice includes line items, payment information, and related order details. Supports pagination and sorting.',
      options: MagentoSearchOptionsEn,
    },
    salesShipmentRepositoryV1GetListGet: {
      displayName: 'List Shipments',
      shortDesc: 'Retrieve a collection of order shipments',
      longDesc:
        'Returns a list of shipments based on specified search criteria. Results can be filtered by order ID, customer, creation date, and tracking information. Each shipment includes items shipped, quantities, tracking numbers, and carrier information.',
      options: MagentoSearchOptionsEn,
    },
    salesTransactionRepositoryV1GetListGet: {
      displayName: 'List Payment Transactions',
      shortDesc: 'Retrieve a collection of payment transactions',
      longDesc:
        'Returns a list of payment transactions based on specified search criteria. Results can be filtered by order ID, payment method, transaction type, and status. Each transaction includes amount, status, and related payment gateway information.',
      options: MagentoSearchOptionsEn,
    },
    rmaRmaRepositoryV1DeleteDelete: {
      displayName: 'Delete Return Request',
      shortDesc: 'Remove a Return Merchandise Authorization (RMA)',
      longDesc:
        'Permanently deletes a Return Merchandise Authorization (RMA) request from the system. This operation cannot be undone and removes all associated return information including submitted items, reason codes, and processing history.',
    },
    rmaRmaManagementV1SaveRmaPost: {
      displayName: 'Create Return Request',
      shortDesc: 'Submit a new Return Merchandise Authorization (RMA)',
      longDesc:
        'Creates a new Return Merchandise Authorization (RMA) request for an existing order. The request includes items to be returned, quantities, reason codes, and customer comments. Additional documentation such as images can be attached to support the return request.',
    },
    rmaRmaManagementV1SearchGet: {
      displayName: 'Search Return Requests',
      shortDesc: 'Find Return Merchandise Authorizations (RMAs)',
      longDesc:
        'Searches for Return Merchandise Authorization (RMA) requests based on specified criteria. Results can be filtered by order ID, customer, status, and date range. Each RMA includes return items, processing status, and communication history.',
    },
  },
  triggers: {
    'customer-created-or-updated': {
      displayName: 'Customer Created or Updated',
      shortDesc: 'Triggers when a customer is created or updated in Magento',
      longDesc:
        "This trigger activates when a new customer is created in your Magento store or when an existing customer's information is updated.",
      options: {
        activationCriteria: {
          displayName: 'Activation Criteria',
          shortDesc: 'Specify when this trigger should activate',
          longDesc:
            'Select whether this trigger should activate on customer creation or on customer updates.',
        },
      },
    },
    'invoice-created-or-updated': {
      displayName: 'Invoice Created or Updated',
      shortDesc: 'Triggers when an invoice is created or updated in Magento',
      longDesc:
        'This trigger activates when a new invoice is generated in your Magento store or when an existing invoice is modified.',
      options: {
        activationCriteria: {
          displayName: 'Activation Criteria',
          shortDesc: 'Specify when this trigger should activate',
          longDesc:
            'Select whether this trigger should activate on invoice creation or on invoice updates.',
        },
      },
    },
    'product-created-or-updated': {
      displayName: 'Product Created or Updated',
      shortDesc: 'Triggers when a product is created or updated in Magento',
      longDesc:
        "This trigger activates when a new product is added to your Magento catalog or when an existing product's information is modified.",
      options: {
        activationCriteria: {
          displayName: 'Activation Criteria',
          shortDesc: 'Specify when this trigger should activate',
          longDesc:
            'Select whether this trigger should activate on product creation or on product updates.',
        },
      },
    },
    'order-created': {
      displayName: 'Order Created',
      shortDesc: 'Triggers when a new order is placed in Magento',
      longDesc:
        'This trigger activates when a customer completes the checkout process and places a new order in your Magento store.',
    },
    'shipment-created': {
      displayName: 'Shipment Created',
      shortDesc: 'Triggers when a new shipment is created in Magento',
      longDesc:
        'This trigger activates when a new shipment is created for an order in your Magento store, indicating that products have been shipped to the customer.',
    },
  },
};

export default MagentoAppEn;
