/* eslint-disable max-len */

import { MagentoSearchOptionsEn } from './search-options';

const MagentoAppEn = {
  displayName: 'Magento',
  groups: ['E-commerce Platforms'],
  shortDesc:
    'E-commerce platform for building online stores and managing customers, products, and orders',
  longDesc:
    'Magento is a flexible e-commerce platform that provides businesses with a complete solution for building and managing online stores. This integration allows you to automate workflows when customer, product, order, invoice, or shipment events occur in your Magento store.',
  connectionMessage: {
    title: 'Connect to Magento',
    content: `To connect to Magento, you will need your **Store URL** and an **Integration Access Token**.

## Creating an Integration Token

1. Log in to your Magento Admin Panel
2. Navigate to **System** → **Integrations**
3. Click **Add New Integration**
4. Fill in the integration details:
   - **Name**: Give it a descriptive name (e.g., "Qore Integration")
   - **Email**: Your admin email
   - **Callback URL** and **Identity Link URL**: Can be left empty for token-based access
5. Go to the **API** tab
6. Select the **Resource Access** level:
   - Choose **All** for full access, or
   - Choose **Custom** and select specific resources needed
7. Click **Save**
8. Click **Activate** on the integration
9. Click **Allow** in the confirmation popup
10. Copy the **Access Token** from the displayed credentials

## Connection Details

### Store URL
Your Magento store's base URL (e.g., \`https://your-store.com\`). Include the protocol (https://) but do not include trailing slashes.

### Access Token
The integration access token generated when you activated the integration. This token authenticates all API requests.

## For Magento 2.4.4 and Later

If you're using Magento 2.4.4+, you may need to enable bearer token authentication:

\`\`\`bash
bin/magento config:set oauth/consumer/enable_integration_as_bearer 1
\`\`\`

**Note:** Integration tokens do not expire unless manually revoked. Store your access token securely and limit the integration's API access to only the resources needed for your use case.`,
  },
  actions: {
    customerCustomerRepositoryV1GetByIdGet: {
      groups: ['Customers'],
      displayName: 'Get Customer by ID',
      shortDesc: 'Retrieve a specific customer account by ID',
      longDesc:
        'Retrieves detailed information about a customer account using the customer ID. Returns all customer attributes including address information, account status, and custom attributes.',
    },
    customerCustomerRepositoryV1SavePut: {
      groups: ['Customers'],
      displayName: 'Update Customer',
      shortDesc: 'Update an existing customer account',
      longDesc:
        'Updates customer information for an existing account. This endpoint allows modification of personal information, addresses, custom attributes, and other account details. The customer ID must be included in the request.',
    },
    customerCustomerRepositoryV1DeleteByIdDelete: {
      groups: ['Customers'],
      displayName: 'Delete Customer',
      shortDesc: 'Remove a customer account by ID',
      longDesc:
        'Permanently deletes a customer account from the system. This operation cannot be undone and will remove all customer data associated with the specified ID, including addresses and order history references.',
    },
    customerCustomerRepositoryV1GetListGet: {
      groups: ['Customers'],
      displayName: 'List Customers',
      shortDesc: 'Retrieve a list of customer accounts',
      longDesc:
        'Returns a list of customer accounts that match specified search criteria. Results can be filtered, sorted, and paginated. Use search criteria parameters to narrow results by email, name, creation date, or other customer attributes.',
      options: MagentoSearchOptionsEn,
    },
    customerAccountManagementV1CreateAccountPost: {
      groups: ['Customers'],
      displayName: 'Create Customer Account',
      shortDesc: 'Register a new customer account',
      longDesc:
        'Creates a new customer account with the provided information. Required fields include email, password, and first/last name. Optional details include addresses, date of birth, and custom attributes. Returns the newly created customer ID upon success.',
    },
    catalogProductRepositoryV1SavePost: {
      groups: ['Products'],
      displayName: 'Create Product',
      shortDesc: 'Add a new product to the catalog',
      longDesc:
        'Creates a new product in the catalog with specified attributes, pricing, and inventory information. Products can be simple, configurable, bundled, grouped, virtual, or downloadable. Media gallery entries, tier prices, and custom options can also be defined.',
    },
    catalogProductRepositoryV1GetListGet: {
      groups: ['Products'],
      displayName: 'List Products',
      shortDesc: 'Retrieve a list of products from the catalog',
      longDesc:
        'Returns a collection of products that match the specified search criteria. Results can be filtered by attributes like name, SKU, price, and status. Supports pagination, sorting, and inclusion of custom attributes in the response.',
      options: MagentoSearchOptionsEn,
    },
    catalogProductRepositoryV1SavePut: {
      groups: ['Products'],
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
      groups: ['Products'],
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
      groups: ['Products'],
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
      groups: ['Shopping Carts'],
      displayName: 'List Shopping Carts',
      shortDesc: 'Retrieve a list of active shopping carts',
      longDesc:
        'Returns a collection of active shopping carts that match the specified search criteria. Results can be filtered by customer ID, creation date, and cart status. Each cart includes items, applied coupons, and shipping/billing information if available.',
      options: MagentoSearchOptionsEn,
    },
    salesOrderRepositoryV1GetGet: {
      groups: ['Orders'],
      displayName: 'Get Order Details',
      shortDesc: 'Retrieve detailed information about a specific order',
      longDesc:
        'Retrieves comprehensive information about a specific order by ID. Includes order items, billing and shipping addresses, payment information, applied discounts, and order status history. Useful for order processing and customer service inquiries.',
    },
    salesOrderRepositoryV1GetListGet: {
      groups: ['Orders'],
      displayName: 'List Orders',
      shortDesc: 'Retrieve a list of orders based on search criteria',
      longDesc:
        'Returns a collection of orders that match the specified search criteria. Results can be filtered by customer, status, date range, and total amount. Supports pagination and sorting to efficiently browse large order volumes.',
      options: MagentoSearchOptionsEn,
    },
    salesShipmentRepositoryV1SavePost: {
      groups: ['Shipments'],
      displayName: 'Create Shipment',
      shortDesc: 'Creates a new shipment for an order',
      longDesc:
        'Creates a new shipment record for an existing order, allowing you to document and track the physical sending of order items to the customer. Includes options for specifying tracking numbers, shipping carriers, and shipped items with their quantities.',
    },
    salesInvoiceRepositoryV1SavePost: {
      groups: ['Invoices'],
      displayName: 'Create Invoice',
      shortDesc: 'Creates a new invoice for an order',
      longDesc:
        "Creates a new invoice record for an existing order, documenting the financial transaction and payment request. Allows for specifying line items to be invoiced, payment details, and comments that will appear on the customer's invoice.",
    },
    salesOrderRepositoryV1SavePut: {
      groups: ['Orders'],
      displayName: 'Create Order',
      shortDesc: 'Persists order information to the system',
      longDesc:
        'Performs persist operations for a specified order. Saves the order data to the database, including customer information, line items, payment details, shipping information, and other relevant order metadata.',
    },
    salesOrderManagementV1AddCommentPost: {
      groups: ['Orders'],
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
      groups: ['Orders'],
      displayName: 'Get Order Comments',
      shortDesc: 'Retrieve the comment history for an order',
      longDesc:
        'Returns the complete comment history for a specific order. Results include comment text, timestamp, author information, and visibility status (customer-visible or admin-only). Comments are returned in chronological order.',
    },
    salesInvoiceRepositoryV1GetListGet: {
      groups: ['Invoices'],
      displayName: 'List Invoices',
      shortDesc: 'Retrieve a collection of invoices',
      longDesc:
        'Returns a list of invoices based on specified search criteria. Results can be filtered by order ID, customer, date, and amount. Each invoice includes line items, payment information, and related order details. Supports pagination and sorting.',
      options: MagentoSearchOptionsEn,
    },
    salesShipmentRepositoryV1GetListGet: {
      groups: ['Shipments'],
      displayName: 'List Shipments',
      shortDesc: 'Retrieve a collection of order shipments',
      longDesc:
        'Returns a list of shipments based on specified search criteria. Results can be filtered by order ID, customer, creation date, and tracking information. Each shipment includes items shipped, quantities, tracking numbers, and carrier information.',
      options: MagentoSearchOptionsEn,
    },
    salesTransactionRepositoryV1GetListGet: {
      groups: ['Payments'],
      displayName: 'List Payment Transactions',
      shortDesc: 'Retrieve a collection of payment transactions',
      longDesc:
        'Returns a list of payment transactions based on specified search criteria. Results can be filtered by order ID, payment method, transaction type, and status. Each transaction includes amount, status, and related payment gateway information.',
      options: MagentoSearchOptionsEn,
    },
    rmaRmaRepositoryV1DeleteDelete: {
      groups: ['Returns & RMAs'],
      displayName: 'Delete Return Request',
      shortDesc: 'Remove a Return Merchandise Authorization (RMA)',
      longDesc:
        'Permanently deletes a Return Merchandise Authorization (RMA) request from the system. This operation cannot be undone and removes all associated return information including submitted items, reason codes, and processing history.',
    },
    rmaRmaManagementV1SaveRmaPost: {
      groups: ['Returns & RMAs'],
      displayName: 'Create Return Request',
      shortDesc: 'Submit a new Return Merchandise Authorization (RMA)',
      longDesc:
        'Creates a new Return Merchandise Authorization (RMA) request for an existing order. The request includes items to be returned, quantities, reason codes, and customer comments. Additional documentation such as images can be attached to support the return request.',
    },
    rmaRmaManagementV1SearchGet: {
      groups: ['Returns & RMAs'],
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
