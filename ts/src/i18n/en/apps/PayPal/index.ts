/* eslint-disable max-len */
const PayPalAppEn = {
  displayName: 'PayPal',
  groups: ['Payment Processing'],
  shortDesc:
    'Integrate with PayPal to manage payments, orders, invoices, disputes, and subscriptions through comprehensive APIs.',
  longDesc:
    "The PayPal integration provides complete access to PayPal's REST APIs for managing e-commerce transactions. Create and capture orders, process payments and refunds, manage invoices and billing, handle customer disputes, set up recurring subscriptions, and receive real-time webhook notifications. Perfect for businesses of all sizes looking to accept payments securely and efficiently.",

  actions: {
    create_order: {
      displayName: 'Create Order',
      shortDesc: 'Create a new payment order with purchase details',
      longDesc:
        'Creates a new PayPal order with specified payment amount, items, shipping details, and payment preferences. Orders represent a payment between two or more parties and can be authorized immediately or captured later. Supports various payment sources including PayPal, cards, and alternative payment methods.',
      options: {
        intent: {
          displayName: 'Payment Intent',
          shortDesc: 'Whether to capture payment immediately or authorize for later capture',
          longDesc:
            'Determines when the payment will be processed. CAPTURE processes payment immediately after approval, while AUTHORIZE places a hold on funds for up to 29 days, allowing you to capture payment when ready to fulfill the order.',
        },
        currency_code: {
          displayName: 'Currency Code',
          shortDesc: 'Three-letter ISO currency code for the transaction',
          longDesc:
            'The three-character ISO-4217 currency code that identifies the currency for this transaction. Must be supported by PayPal and match your business account settings.',
        },
        total_amount: {
          displayName: 'Total Amount',
          shortDesc: 'Total payment amount as a string',
          longDesc:
            'The total amount for this order. Must be a positive number and match the sum of all breakdown components if provided. Format as a string with appropriate decimal precision for the currency.',
        },
        item_total: {
          displayName: 'Item Total',
          shortDesc: 'Total cost of all items before taxes and fees',
          longDesc:
            'The total cost of all items in the order before applying taxes, shipping, handling, insurance, or discounts. Should equal the sum of (quantity × unit_amount) for all items.',
        },
        shipping_amount: {
          displayName: 'Shipping Amount',
          shortDesc: 'Cost of shipping for this order',
          longDesc:
            'The shipping cost for delivering the items in this order. This amount is added to the total order amount.',
        },
        handling_amount: {
          displayName: 'Handling Amount',
          shortDesc: 'Handling fee for processing this order',
          longDesc:
            'Additional handling fee charged for processing this order. This covers costs like packaging and order processing.',
        },
        tax_total: {
          displayName: 'Tax Total',
          shortDesc: 'Total tax amount for this order',
          longDesc:
            'The total tax amount for all items in this order. This includes sales tax, VAT, or other applicable taxes based on the shipping address and local regulations.',
        },
        insurance_amount: {
          displayName: 'Insurance Amount',
          shortDesc: 'Insurance cost for this shipment',
          longDesc:
            'Optional insurance amount to protect the shipment. This covers the value of items in case of loss or damage during shipping.',
        },
        shipping_discount: {
          displayName: 'Shipping Discount',
          shortDesc: 'Discount applied to shipping costs',
          longDesc:
            'Any discount applied specifically to shipping costs, such as free shipping promotions or reduced shipping fees for bulk orders.',
        },
        discount_amount: {
          displayName: 'Discount Amount',
          shortDesc: 'Total discount applied to the order',
          longDesc:
            'The total discount amount applied to this order, including coupon codes, promotions, or bulk discounts. This reduces the overall order total.',
        },
        payee_email: {
          displayName: 'Payee Email',
          shortDesc: 'Email address of the payment recipient',
          longDesc:
            'The email address of the merchant or seller who will receive the payment. Required for marketplace transactions or when specifying a different recipient.',
        },
        payee_merchant_id: {
          displayName: 'Payee Merchant ID',
          shortDesc: 'PayPal merchant ID of the payment recipient',
          longDesc:
            'The PayPal merchant ID of the account that will receive the payment. Used for marketplace transactions or when routing payments to specific merchants.',
        },
        description: {
          displayName: 'Order Description',
          shortDesc: 'Description of the order or purchase',
          longDesc:
            'A brief description of the order that will be visible to the customer during checkout and in their transaction history.',
        },
        custom_id: {
          displayName: 'Custom ID',
          shortDesc: 'Your custom identifier for this order',
          longDesc:
            'A custom identifier that you can use to track this order in your own systems. This will be returned in webhooks and API responses.',
        },
        invoice_id: {
          displayName: 'Invoice ID',
          shortDesc: 'Invoice number for this order',
          longDesc:
            'The invoice number for this order. Helps match orders with your accounting system and prevents duplicate payments.',
        },
        soft_descriptor: {
          displayName: 'Soft Descriptor',
          shortDesc: "Text that appears on customer's credit card statement",
          longDesc:
            "The text that appears on the customer's credit card or bank statement. Keep it short and recognizable to avoid chargebacks.",
        },
        items: {
          displayName: 'Order Items',
          shortDesc: 'List of items being purchased',
          longDesc:
            'Array of items included in this order. Each item should specify name, quantity, unit price, and optionally description, SKU, category, and tax amount.',
          type: {
            element_type: {
              type: {
                fields: {
                  name: {
                    displayName: 'Item Name',
                    shortDesc: 'Name of the item',
                    longDesc:
                      'A descriptive name for this item that will be shown to the customer during checkout.',
                  },
                  quantity: {
                    displayName: 'Quantity',
                    shortDesc: 'Number of items',
                    longDesc:
                      'The quantity of this item being purchased. Must be a positive integer.',
                  },
                  unit_price: {
                    displayName: 'Unit Price',
                    shortDesc: 'Price per individual item',
                    longDesc:
                      'The cost per individual unit of this item, before taxes and discounts.',
                  },
                  description: {
                    displayName: 'Item Description',
                    shortDesc: 'Detailed description of the item',
                    longDesc:
                      'Optional detailed description providing more information about this item.',
                  },
                  sku: {
                    displayName: 'SKU',
                    shortDesc: 'Stock keeping unit identifier',
                    longDesc: 'Your internal stock keeping unit identifier for inventory tracking.',
                  },
                  url: {
                    displayName: 'Item URL',
                    shortDesc: 'Link to the item page',
                    longDesc:
                      'Optional URL linking to the product page where customers can view more details about this item.',
                  },
                  category: {
                    displayName: 'Item Category',
                    shortDesc: 'Category type of the item',
                    longDesc:
                      'The category classification for this item, which affects payment processing and compliance requirements.',
                  },
                  tax_amount: {
                    displayName: 'Tax Amount',
                    shortDesc: 'Tax amount for this item',
                    longDesc:
                      'The tax amount specifically for this item, calculated based on quantity and applicable tax rates.',
                  },
                },
              },
            },
          },
        },
        shipping_type: {
          displayName: 'Shipping Type',
          shortDesc: 'Method of delivery for this order',
          longDesc:
            'Specifies how the items will be delivered to the customer. Affects shipping costs and delivery timeline.',
        },
        shipping_name: {
          displayName: 'Shipping Name',
          shortDesc: 'Full name for shipping address',
          longDesc:
            'The complete name of the person who will receive the shipment at the delivery address.',
        },
        shipping_address_line_1: {
          displayName: 'Shipping Address Line 1',
          shortDesc: 'Primary shipping address',
          longDesc:
            'The first line of the shipping address, typically containing street number and name.',
        },
        shipping_address_line_2: {
          displayName: 'Shipping Address Line 2',
          shortDesc: 'Secondary shipping address line',
          longDesc:
            'Optional second line of the shipping address for apartment numbers, suite numbers, or additional location details.',
        },
        shipping_city: {
          displayName: 'Shipping City',
          shortDesc: 'City for shipping address',
          longDesc: 'The city where the items will be delivered.',
        },
        shipping_state: {
          displayName: 'Shipping State',
          shortDesc: 'State or province for shipping',
          longDesc:
            'The state, province, or region for the shipping address. Use appropriate codes for the country.',
        },
        shipping_postal_code: {
          displayName: 'Shipping Postal Code',
          shortDesc: 'ZIP or postal code for shipping',
          longDesc: 'The ZIP code, postal code, or equivalent for the shipping address.',
        },
        shipping_country_code: {
          displayName: 'Shipping Country Code',
          shortDesc: 'Two-letter country code for shipping',
          longDesc: 'The two-character ISO 3166-1 country code for the shipping address.',
        },
        platform_fees: {
          displayName: 'Platform Fees',
          shortDesc: 'Fees collected by the platform',
          longDesc:
            'Array of platform fees to be collected on this transaction. Used by marketplaces to collect fees from transactions processed on their platform.',
          type: {
            element_type: {
              type: {
                fields: {
                  fee_amount: {
                    displayName: 'Fee Amount',
                    shortDesc: 'Platform fee amount',
                    longDesc:
                      'The amount of the platform fee to be collected from this transaction.',
                  },
                  payee_email: {
                    displayName: 'Fee Recipient Email',
                    shortDesc: 'Email of fee recipient',
                    longDesc: 'Email address of the account that will receive the platform fee.',
                  },
                  payee_merchant_id: {
                    displayName: 'Fee Recipient Merchant ID',
                    shortDesc: 'Merchant ID of fee recipient',
                    longDesc:
                      'PayPal merchant ID of the account that will receive the platform fee.',
                  },
                },
              },
            },
          },
        },
        disbursement_mode: {
          displayName: 'Disbursement Mode',
          shortDesc: 'When to release funds to the seller',
          longDesc:
            'Controls when captured funds are released to the seller. INSTANT releases funds immediately, while DELAYED allows you to hold funds for verification before release.',
        },
        return_url: {
          displayName: 'Return URL',
          shortDesc: 'URL to redirect after successful payment',
          longDesc:
            'The URL where customers will be redirected after successfully completing their payment. Should be a page confirming the successful transaction.',
        },
        cancel_url: {
          displayName: 'Cancel URL',
          shortDesc: 'URL to redirect if payment is cancelled',
          longDesc:
            'The URL where customers will be redirected if they cancel the payment process. Should provide information about the cancelled transaction and next steps.',
        },
      },
    },

    capture_order: {
      displayName: 'Capture Order',
      shortDesc: 'Capture payment for an approved order',
      longDesc:
        'Captures payment for an order that has been approved by the customer. This completes the payment process and transfers funds from the customer to your account. Should be called after receiving order approval or for immediate capture orders.',
      options: {
        order_id: {
          displayName: 'Order ID',
          shortDesc: 'ID of the approved order to capture',
          longDesc:
            'The unique identifier of the order that has been approved by the customer and is ready for payment capture.',
        },
        final_capture: {
          displayName: 'Final Capture',
          shortDesc: 'Whether this is the final capture for the order',
          longDesc:
            'Indicates whether this capture completes the payment for the order. Set to true if this is the complete amount, or false if you plan to make additional partial captures.',
        },
        payment_instruction: {
          displayName: 'Payment Instructions',
          shortDesc: 'Additional payment processing instructions',
          longDesc:
            'Special instructions for processing this payment, such as disbursement timing or platform fee collection.',
          type: {
            fields: {
              disbursement_mode: {
                displayName: 'Disbursement Mode',
                shortDesc: 'When to disburse funds',
                longDesc:
                  'Controls when captured funds are disbursed to the payee. Use INSTANT for immediate disbursement or DELAYED to hold funds.',
              },
            },
          },
        },
      },
    },

    authorize_order: {
      displayName: 'Authorize Order',
      shortDesc: 'Authorize payment for an approved order',
      longDesc:
        'Authorizes payment for an order that has been approved by the customer. This places a hold on the funds without capturing them, allowing you to capture the payment later when ready to fulfill the order. Authorization is valid for up to 29 days.',
      options: {
        order_id: {
          displayName: 'Order ID',
          shortDesc: 'ID of the approved order to authorize',
          longDesc:
            'The unique identifier of the order that has been approved by the customer and is ready for payment authorization.',
        },
      },
    },

    get_order: {
      displayName: 'Get Order',
      shortDesc: 'Retrieve order details by ID',
      longDesc:
        'Retrieves complete details for an order by its ID, including current status, payment information, customer details, and transaction history. Use this to check order status or retrieve information for order management.',
      options: {
        order_id: {
          displayName: 'Order ID',
          shortDesc: 'Unique identifier of the order to retrieve',
          longDesc: 'The unique identifier of the order you want to retrieve details for.',
        },
      },
    },

    list_transactions: {
      displayName: 'List Transactions',
      shortDesc: 'Get transaction history for your account',
      longDesc:
        'Retrieves a list of transactions for your PayPal account within a specified date range. Supports filtering by transaction type, status, amount range, currency, and payment method to help you find specific transactions or generate reports.',
      options: {
        start_date: {
          displayName: 'Start Date',
          shortDesc: 'Beginning date for transaction search',
          longDesc:
            'The earliest date to include in the transaction search. Transactions on or after this date will be included in the results.',
        },
        end_date: {
          displayName: 'End Date',
          shortDesc: 'Ending date for transaction search',
          longDesc:
            'The latest date to include in the transaction search. Transactions on or before this date will be included in the results.',
        },
        transaction_type: {
          displayName: 'Transaction Type',
          shortDesc: 'Type of transactions to retrieve',
          longDesc:
            'Filter results by specific transaction types such as payments, refunds, fees, or other transaction categories.',
        },
        transaction_status: {
          displayName: 'Transaction Status',
          shortDesc: 'Status of transactions to include',
          longDesc:
            'Filter transactions by their processing status such as Success, Pending, Denied, or Refunded.',
        },
        transaction_amount: {
          displayName: 'Transaction Amount Range',
          shortDesc: 'Filter by transaction amount range',
          longDesc:
            'Specify a range of transaction amounts to filter results. Useful for finding transactions within specific value ranges.',
          type: {
            fields: {
              from: {
                displayName: 'Minimum Amount',
                shortDesc: 'Minimum transaction amount',
                longDesc: 'The minimum transaction amount to include in results.',
              },
              to: {
                displayName: 'Maximum Amount',
                shortDesc: 'Maximum transaction amount',
                longDesc: 'The maximum transaction amount to include in results.',
              },
            },
          },
        },
        transaction_currency: {
          displayName: 'Transaction Currency',
          shortDesc: 'Filter by currency code',
          longDesc:
            'Filter transactions by currency code to see only transactions in specific currencies.',
        },
        payment_instrument_type: {
          displayName: 'Payment Method Type',
          shortDesc: 'Filter by payment method used',
          longDesc:
            'Filter transactions by the type of payment method used, such as credit card, debit card, or bank account.',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Number of transactions per page',
          longDesc:
            'The maximum number of transactions to return in a single response. Use for pagination of large result sets.',
        },
        page: {
          displayName: 'Page Number',
          shortDesc: 'Page number for pagination',
          longDesc: 'The page number to retrieve when paginating through large result sets.',
        },
      },
    },

    refund_payment: {
      displayName: 'Refund Payment',
      shortDesc: 'Process a refund for a captured payment',
      longDesc:
        "Issues a refund for a previously captured payment. Can process full or partial refunds. The refunded amount will be returned to the customer's original payment method and deducted from your account balance.",
      options: {
        capture_id: {
          displayName: 'Capture ID',
          shortDesc: 'ID of the captured payment to refund',
          longDesc:
            'The unique identifier of the captured payment that you want to refund. This can be found in the capture response or order details.',
        },
        amount: {
          displayName: 'Refund Amount',
          shortDesc: 'Amount to refund (optional for full refund)',
          longDesc:
            'The amount to refund. If not specified, the full captured amount will be refunded. For partial refunds, specify the currency and amount.',
          type: {
            fields: {
              currency_code: {
                displayName: 'Currency Code',
                shortDesc: 'Currency for the refund amount',
                longDesc: 'The three-character ISO currency code for the refund amount.',
              },
              value: {
                displayName: 'Refund Value',
                shortDesc: 'The refund amount as a string',
                longDesc:
                  'The amount to refund, formatted as a string with appropriate decimal precision.',
              },
            },
          },
        },
        note_to_payer: {
          displayName: 'Note to Payer',
          shortDesc: 'Optional note explaining the refund',
          longDesc:
            'An optional note that will be sent to the customer explaining the reason for the refund.',
        },
        invoice_id: {
          displayName: 'Invoice ID',
          shortDesc: 'Invoice ID for the refund',
          longDesc:
            'Optional invoice ID to associate with this refund for accounting and tracking purposes.',
        },
      },
    },

    create_invoice: {
      displayName: 'Create Invoice',
      shortDesc: 'Create a new invoice for payment',
      longDesc:
        'Creates a new invoice that can be sent to customers for payment. Includes item details, pricing, tax information, and payment terms. Invoices can be automatically sent to recipients or manually shared.',
      options: {
        invoice_number: {
          displayName: 'Invoice Number',
          shortDesc: 'Unique invoice number for tracking',
          longDesc:
            'A unique identifier for this invoice. If not provided, PayPal will generate one automatically.',
        },
        currency_code: {
          displayName: 'Currency Code',
          shortDesc: 'Currency for the invoice amount',
          longDesc: 'The three-character ISO currency code for this invoice.',
        },
        note: {
          displayName: 'Note',
          shortDesc: 'Note or memo for the invoice',
          longDesc: 'Optional note or memo to include with the invoice. Visible to the recipient.',
        },
        recipient_email: {
          displayName: 'Recipient Email',
          shortDesc: 'Email address of the invoice recipient',
          longDesc:
            'The email address where the invoice will be sent. This is the primary recipient who will receive payment requests.',
        },
        recipient_first_name: {
          displayName: 'Recipient First Name',
          shortDesc: 'First name of the invoice recipient',
          longDesc: 'The first name of the person or business contact receiving the invoice.',
        },
        recipient_last_name: {
          displayName: 'Recipient Last Name',
          shortDesc: 'Last name of the invoice recipient',
          longDesc: 'The last name of the person receiving the invoice.',
        },
        item_name: {
          displayName: 'Item Name',
          shortDesc: 'Name of the item or service',
          longDesc: 'A descriptive name for the product or service being invoiced.',
        },
        item_description: {
          displayName: 'Item Description',
          shortDesc: 'Detailed description of the item',
          longDesc:
            'Optional detailed description providing more information about the product or service.',
        },
        item_quantity: {
          displayName: 'Item Quantity',
          shortDesc: 'Number of items or units',
          longDesc: 'The quantity of the item being invoiced. Defaults to 1 if not specified.',
        },
        item_unit_price: {
          displayName: 'Unit Price',
          shortDesc: 'Price per unit of the item',
          longDesc: 'The cost per individual unit of the item or service.',
        },
        tax_percent: {
          displayName: 'Tax Percentage',
          shortDesc: 'Tax rate to apply to the item',
          longDesc: 'The tax rate as a percentage to be applied to the item amount.',
        },
        tax_name: {
          displayName: 'Tax Name',
          shortDesc: 'Name for the tax (e.g., "Sales Tax")',
          longDesc:
            'A descriptive name for the tax being applied, such as "Sales Tax", "VAT", or "GST".',
        },
        payment_term: {
          displayName: 'Payment Terms',
          shortDesc: 'When payment is due',
          longDesc:
            'Specifies when payment is due for this invoice, such as immediately upon receipt or within a specific number of days.',
        },
        send_to_recipient: {
          displayName: 'Send to Recipient',
          shortDesc: 'Automatically send the invoice via email',
          longDesc:
            "If true, the invoice will be automatically sent to the recipient's email address. If false, you can send it manually later.",
        },
      },
    },

    get_invoice: {
      displayName: 'Get Invoice',
      shortDesc: 'Retrieve invoice details by ID',
      longDesc:
        'Retrieves complete details for an invoice by its ID, including payment status, recipient information, line items, and payment history.',
      options: {
        invoice_id: {
          displayName: 'Invoice ID',
          shortDesc: 'Unique identifier of the invoice to retrieve',
          longDesc: 'The unique identifier of the invoice you want to retrieve details for.',
        },
      },
    },

    list_invoices: {
      displayName: 'List Invoices',
      shortDesc: 'Get a list of your invoices',
      longDesc:
        'Retrieves a paginated list of invoices in your account. Use pagination parameters to navigate through large numbers of invoices.',
      options: {
        page: {
          displayName: 'Page Number',
          shortDesc: 'Page number for pagination',
          longDesc: 'The page number to retrieve when paginating through invoices.',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Number of invoices per page',
          longDesc: 'The maximum number of invoices to return in a single response.',
        },
      },
    },

    list_disputes: {
      displayName: 'List Disputes',
      shortDesc: 'Get a list of customer disputes',
      longDesc:
        'Retrieves a list of customer disputes for your account. Disputes occur when customers challenge transactions, and this API helps you manage and respond to them effectively.',
      options: {
        start_time: {
          displayName: 'Start Time',
          shortDesc: 'Earliest dispute creation time to include',
          longDesc: 'Filter disputes created on or after this date and time.',
        },
        disputed_transaction_id: {
          displayName: 'Disputed Transaction ID',
          shortDesc: 'Filter by specific transaction ID',
          longDesc: 'Show only disputes related to a specific transaction ID.',
        },
        dispute_states: {
          displayName: 'Dispute States',
          shortDesc: 'Filter by dispute states',
          longDesc:
            'Filter disputes by their current states, such as open, under review, or resolved.',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Number of disputes per page',
          longDesc: 'The maximum number of disputes to return in a single response.',
        },
        next_page_token: {
          displayName: 'Next Page Token',
          shortDesc: 'Token for retrieving the next page',
          longDesc: 'Token for pagination to retrieve the next page of disputes.',
        },
        update_time_before: {
          displayName: 'Updated Before',
          shortDesc: 'Include disputes updated before this date',
          longDesc: 'Filter disputes that were last updated before this date and time.',
        },
        update_time_after: {
          displayName: 'Updated After',
          shortDesc: 'Include disputes updated after this date',
          longDesc: 'Filter disputes that were last updated after this date and time.',
        },
      },
    },
  },

  triggers: {
    order_trigger: {
      displayName: 'Order Events',
      shortDesc: 'Receive notifications when order events occur',
      longDesc:
        'Triggers when specific order-related events happen, such as when an order is approved by the customer, completed, or when payment approval is reversed. Use this to automate order processing workflows and handle order status changes.',
      options: {
        event_name: {
          displayName: 'Order Event Type',
          shortDesc: 'The specific order event to listen for',
          longDesc:
            'Select which order event should trigger this webhook. Each event represents a different stage in the order lifecycle.',
        },
      },
    },

    invoice_trigger: {
      displayName: 'Invoice Events',
      shortDesc: 'Receive notifications when invoice events occur',
      longDesc:
        'Triggers when invoice-related events happen, such as when an invoice is created, paid, cancelled, refunded, or updated. Essential for managing billing workflows and keeping invoice status synchronized with your systems.',
      options: {
        event_name: {
          displayName: 'Invoice Event Type',
          shortDesc: 'The specific invoice event to listen for',
          longDesc:
            'Select which invoice event should trigger this webhook. Each event represents a different stage in the invoice lifecycle.',
        },
      },
    },

    subscription_trigger: {
      displayName: 'Subscription Events',
      shortDesc: 'Receive notifications when subscription events occur',
      longDesc:
        'Triggers when subscription-related events happen, including subscription creation, activation, updates, cancellation, expiration, or suspension. Critical for managing recurring billing and subscription lifecycle automation.',
      options: {
        event_name: {
          displayName: 'Subscription Event Type',
          shortDesc: 'The specific subscription event to listen for',
          longDesc:
            'Select which subscription event should trigger this webhook. Each event represents a different stage in the subscription lifecycle.',
        },
      },
    },

    dispute_trigger: {
      displayName: 'Dispute Events',
      shortDesc: 'Receive notifications when dispute events occur',
      longDesc:
        'Triggers when customer dispute events occur, such as when a new dispute is created, updated, or resolved. Essential for managing customer service workflows and responding to payment disputes promptly.',
      options: {
        event_name: {
          displayName: 'Dispute Event Type',
          shortDesc: 'The specific dispute event to listen for',
          longDesc:
            'Select which dispute event should trigger this webhook. Each event represents a different stage in the dispute resolution process.',
        },
      },
    },
  },
};

export default PayPalAppEn;
