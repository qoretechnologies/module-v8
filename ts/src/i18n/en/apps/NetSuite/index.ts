const NetSuiteAppEn = {
  displayName: 'NetSuite',
  groups: ['Accounting & ERP'],
  shortDesc: 'A comprehensive suite of cloud-based business management solutions.',
  longDesc:
    'NetSuite offers a unified platform for ERP, CRM, e-commerce, and more, enabling businesses to manage all key operations in a single system.',
  triggers: {
    new_record: {
      displayName: 'New Record',
      shortDesc: 'Triggers when a new record is created',
      longDesc: 'Triggers when a new record is created',
      options: {
        recordType: {
          displayName: 'Record Type',
          shortDesc: 'The type of record to monitor',
          longDesc: 'The type of record to monitor',
        },
      },
    },
  },
  actions: {
    list_records: {
      groups: ['Data & Search'],
      displayName: 'List Records',
      shortDesc: 'Retrieve NetSuite records based on search criteria',
      longDesc:
        'Query NetSuite records by type with optional filtering, field selection, and pagination',
      options: {
        recordType: {
          displayName: 'Record Type',
          shortDesc: 'Type of NetSuite record to retrieve',
          longDesc:
            'Specifies which NetSuite record type to query (customer, invoice, transaction, etc.)',
        },
        searchMode: {
          displayName: 'Search Mode',
          shortDesc: 'How multiple search criteria are combined',
          longDesc:
            'Determines if records must match all criteria (All) or any criteria (Any) when multiple query fields are provided',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'Specific record fields to return',
          longDesc: 'List of field names to include in results (returns all fields if omitted)',
        },
        query: {
          displayName: 'Query Criteria',
          shortDesc: 'Search conditions for filtering records',
          longDesc: 'Key-value pairs defining search criteria',
          type: {
            element_type: {
              fields: {
                key: {
                  displayName: 'Field Name',
                  shortDesc: 'Name of the field to filter by',
                  longDesc: 'The name of the field to filter by',
                },
                value: {
                  displayName: 'Field Value',
                  shortDesc: 'Value to match for the field',
                  longDesc: 'The value to match for the field',
                },
              },
            },
          },
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of records to return',
          longDesc: 'Caps the number of results returned in a single query',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of records to skip',
          longDesc: 'Used for pagination to skip a specified number of records in the result set',
        },
      },
    },
    suite_ql: {
      groups: ['Data & Search'],
      displayName: 'SuiteQL',
      shortDesc: 'Run a SuiteQL query',
      longDesc: 'Run a SuiteQL query',
      options: {
        query: {
          displayName: 'Query',
          shortDesc: 'The SuiteQL query to run',
          longDesc: 'The SuiteQL query to run',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'The maximum number of records to return',
          longDesc: 'The maximum number of records to return',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'The number of records to skip',
          longDesc: 'The number of records to skip',
        },
        response_type: {
          fields: {
            links: {
              display_name: 'Links',
              short_desc: 'Links',
              desc: 'Links',
            },
            count: {
              display_name: 'Count',
              short_desc: 'The number of results',
              desc: 'The number of results',
            },
            hasMore: {
              display_name: 'Has More',
              short_desc: 'Whether there are more results',
              desc: 'Whether there are more results',
            },
            items: {
              display_name: 'Items',
              short_desc: 'The items',
              desc: 'The items',
            },
          },
        },
      },
    },
    account_get: {
      groups: ['Accounting'],
      displayName: 'Get List of Accounts',
      shortDesc: 'Retrieve a list of accounts.',
      longDesc: 'Fetches a list of accounts based on specified filters.',
    },
    account_post: {
      groups: ['Accounting'],
      displayName: 'Create Account',
      shortDesc: 'Creates a new account.',
      longDesc: 'Allows the user to create a new account record in NetSuite.',
    },
    account_id_get: {
      groups: ['Accounting'],
      displayName: 'Get Account',
      shortDesc: 'Retrieve details of a specific account.',
      longDesc: 'Fetches detailed information of a single account by its ID.',
    },
    account_id_patch: {
      groups: ['Accounting'],
      displayName: 'Update Account',
      shortDesc: 'Updates an existing account.',
      longDesc: 'Allows the user to update details of a specific account by its ID.',
    },
    account_id_delete: {
      groups: ['Accounting'],
      displayName: 'Delete Account',
      shortDesc: 'Deletes a specific account.',
      longDesc: 'Removes an account record from NetSuite based on its ID.',
    },
    customer_get: {
      groups: ['CRM'],
      displayName: 'Get List of Customers',
      shortDesc: 'Retrieve a list of customers.',
      longDesc: 'Fetches a list of customers based on specified filters.',
    },
    customer_post: {
      groups: ['CRM'],
      displayName: 'Create Customer',
      shortDesc: 'Creates a new customer.',
      longDesc: 'Allows the user to create a new customer record in NetSuite.',
    },
    customer_id_get: {
      groups: ['CRM'],
      displayName: 'Get Customer',
      shortDesc: 'Retrieve details of a specific customer.',
      longDesc: 'Fetches detailed information of a single customer by its ID.',
    },
    customer_id_patch: {
      groups: ['CRM'],
      displayName: 'Update Customer',
      shortDesc: 'Updates an existing customer.',
      longDesc: 'Allows the user to update details of a specific customer by its ID.',
    },
    customer_id_delete: {
      groups: ['CRM'],
      displayName: 'Delete Customer',
      shortDesc: 'Deletes a specific customer.',
      longDesc: 'Removes a customer record from NetSuite based on its ID.',
    },
    contact_get: {
      groups: ['CRM'],
      displayName: 'Get List of Contacts',
      shortDesc: 'Retrieve a list of contacts.',
      longDesc: 'Fetches a list of contacts based on specified filters.',
    },
    contact_post: {
      groups: ['CRM'],
      displayName: 'Create Contact',
      shortDesc: 'Creates a new contact.',
      longDesc: 'Allows the user to create a new contact record in NetSuite.',
    },
    contact_id_delete: {
      groups: ['CRM'],
      displayName: 'Delete Contact',
      shortDesc: 'Deletes a specific contact.',
      longDesc: 'Removes a contact record from NetSuite based on its ID.',
    },
    contact_id_get: {
      groups: ['CRM'],
      displayName: 'Get Contact',
      shortDesc: 'Retrieve details of a specific contact.',
      longDesc: 'Fetches detailed information of a single contact by its ID.',
    },
    contact_id_patch: {
      groups: ['CRM'],
      displayName: 'Update Contact',
      shortDesc: 'Updates an existing contact.',
      longDesc: 'Allows the user to update details of a specific contact by its ID.',
    },
    opportunity_get: {
      groups: ['CRM'],
      displayName: 'Get List of Opportunities',
      shortDesc: 'Retrieve a list of opportunities.',
      longDesc: 'Fetches a list of opportunities based on specified filters.',
    },
    opportunity_id_delete: {
      groups: ['CRM'],
      displayName: 'Delete Opportunity',
      shortDesc: 'Deletes a specific opportunity.',
      longDesc: 'Removes an opportunity record from NetSuite based on its ID.',
    },
    opportunity_id_get: {
      groups: ['CRM'],
      displayName: 'Get Opportunity',
      shortDesc: 'Retrieve details of a specific opportunity.',
      longDesc: 'Fetches detailed information of a single opportunity by its ID.',
    },
    opportunity_id_patch: {
      groups: ['CRM'],
      displayName: 'Update Opportunity',
      shortDesc: 'Updates an existing opportunity.',
      longDesc: 'Allows the user to update details of a specific opportunity by its ID.',
    },
    opportunity_post: {
      groups: ['CRM'],
      displayName: 'Create Opportunity',
      shortDesc: 'Creates a new opportunity.',
      longDesc: 'Allows the user to create a new opportunity record in NetSuite.',
    },
    invoice_get: {
      groups: ['Sales & Billing'],
      displayName: 'Get List of Invoices',
      shortDesc: 'Retrieve a list of invoices.',
      longDesc: 'Fetches a list of invoices based on specified filters.',
    },
    invoice_post: {
      groups: ['Sales & Billing'],
      displayName: 'Create Invoice',
      shortDesc: 'Creates a new invoice.',
      longDesc: 'Allows the user to create a new invoice record in NetSuite.',
      options: {
        entity: {
          displayName: 'Customer for the invoice',
          shortDesc: 'The customer for the invoice',
          longDesc: 'The customer for the invoice',
        },
      },
    },
    invoice_id_get: {
      groups: ['Sales & Billing'],
      displayName: 'Get Invoice',
      shortDesc: 'Retrieve details of a specific invoice.',
      longDesc: 'Fetches detailed information of a single invoice by its ID.',
    },
    invoice_id_patch: {
      groups: ['Sales & Billing'],
      displayName: 'Update Invoice',
      shortDesc: 'Updates an existing invoice.',
      longDesc: 'Allows the user to update details of a specific invoice by its ID.',
    },
    invoice_id_delete: {
      groups: ['Sales & Billing'],
      displayName: 'Delete Invoice',
      shortDesc: 'Deletes a specific invoice.',
      longDesc: 'Removes an invoice record from NetSuite based on its ID.',
    },
    journalEntry_get: {
      groups: ['Accounting'],
      displayName: 'Get List of Journal Entries',
      shortDesc: 'Retrieve a list of journal entries.',
      longDesc: 'Fetches a list of journal entries based on specified filters.',
    },
    journalEntry_post: {
      groups: ['Accounting'],
      displayName: 'Create Journal Entry',
      shortDesc: 'Creates a new journal entry.',
      longDesc: 'Allows the user to create a new journal entry record in NetSuite.',
    },
    journalEntry_id_get: {
      groups: ['Accounting'],
      displayName: 'Get Journal Entry',
      shortDesc: 'Retrieve details of a specific journal entry.',
      longDesc: 'Fetches detailed information of a single journal entry by its ID.',
    },
    journal_entry_id_patch: {
      groups: ['Accounting'],
      displayName: 'Update Journal Entry',
      shortDesc: 'Updates an existing journal entry.',
      longDesc: 'Allows the user to update details of a specific journal entry by its ID.',
    },
    journalEntry_id_delete: {
      groups: ['Accounting'],
      displayName: 'Delete Journal Entry',
      shortDesc: 'Deletes a specific journal entry.',
      longDesc: 'Removes a journal entry record from NetSuite based on its ID.',
    },
    purchaseOrder_get: {
      groups: ['Procurement'],
      displayName: 'Get List of Purchase Orders',
      shortDesc: 'Retrieve a list of purchase orders.',
      longDesc: 'Fetches a list of purchase orders based on specified filters.',
    },
    purchaseOrder_post: {
      groups: ['Procurement'],
      displayName: 'Create Purchase Order',
      shortDesc: 'Creates a new purchase order.',
      longDesc: 'Allows the user to create a new purchase order record in NetSuite.',
      options: {
        entity: {
          displayName: 'Vendor',
          shortDesc: 'The vendor for the purchase order',
          longDesc: 'The vendor for the purchase order ',
        },
        employee: {
          displayName: 'Employee (Requestor)',
          shortDesc: 'The employee who requested the purchase order',
          longDesc: 'The employee who requested the purchase order',
        },
      },
    },
    purchaseOrder_id_get: {
      groups: ['Procurement'],
      displayName: 'Get Purchase Order',
      shortDesc: 'Retrieve details of a specific purchase order.',
      longDesc: 'Fetches detailed information of a single purchase order by its ID.',
    },
    purchaseOrder_id_patch: {
      groups: ['Procurement'],
      displayName: 'Update Purchase Order',
      shortDesc: 'Updates an existing purchase order.',
      longDesc: 'Allows the user to update details of a specific purchase order by its ID.',
      options: {
        entity: {
          displayName: 'Vendor',
          shortDesc: 'The vendor for the purchase order',
          longDesc: 'The vendor for the purchase order ',
        },
        employee: {
          displayName: 'Employee (Requestor)',
          shortDesc: 'The employee who requested the purchase order',
          longDesc: 'The employee who requested the purchase order',
        },
      },
    },
    purchaseOrder_id_delete: {
      groups: ['Procurement'],
      displayName: 'Delete Purchase Order',
      shortDesc: 'Deletes a specific purchase order.',
      longDesc: 'Removes a purchase order record from NetSuite based on its ID.',
    },
    salesOrder_get: {
      groups: ['Sales & Billing'],
      displayName: 'Get List of Sales Orders',
      shortDesc: 'Retrieve a list of sales orders.',
      longDesc: 'Fetches a list of sales orders based on specified filters.',
    },
    salesOrder_post: {
      groups: ['Sales & Billing'],
      displayName: 'Create Sales Order',
      shortDesc: 'Creates a new sales order.',
      longDesc: 'Allows the user to create a new sales order record in NetSuite.',
      options: {
        entity: {
          displayName: 'Customer',
          shortDesc: 'The customer for the sales order',
          longDesc: 'The customer for the sales order ',
        },
      },
    },
    customer_post_simplified: {
      groups: ['CRM'],
      displayName: 'Create Customer (Simplified)',
      shortDesc: 'Creates a new customer with simplified options.',
      longDesc: 'Creates a new customer in NetSuite with simplified fields',
      options: {
        entityStatus: {
          displayName: 'Status',
          shortDesc: 'Customer status',
          longDesc: 'The status of the customer (e.g., Active, Inactive)',
        },
        subsidiary: {
          displayName: 'Subsidiary',
          shortDesc: 'The subsidiary for the customer',
          longDesc: 'The subsidiary for the customer',
        },
      },
    },
    salesOrder_post_simplified: {
      groups: ['Sales & Billing'],
      displayName: 'Create Sales Order (Simplified)',
      shortDesc: 'Creates a new sales order with simplified options.',
      longDesc:
        'Creates a new customer sales order in NetSuite with only the most commonly used fields, making order creation faster and more straightforward.',
      options: {
        entity: {
          displayName: 'Customer',
          shortDesc: 'Customer for this order',
          longDesc:
            'The NetSuite internal ID of the customer this sales order is for. Must be an existing customer record in your NetSuite account.',
        },
        memo: {
          displayName: 'Memo',
          shortDesc: 'Order notes',
          longDesc:
            'Additional notes or information about this order. This will appear in the memo field on the sales order record.',
        },
        orderStatus: {
          displayName: 'Order Status',
          shortDesc: 'Current status of order',
          longDesc:
            'The processing status of this sales order (e.g., Pending Approval, Pending Fulfillment). Controls workflow and availability for further processing.',
        },
        item: {
          displayName: 'Order Items',
          shortDesc: 'Products or services being ordered',
          longDesc:
            'List of items being purchased in this order. Each item requires an ID and amount',
          type: {
            element_type: {
              fields: {
                id: {
                  displayName: 'Item ID',
                  shortDesc: 'NetSuite item identifier',
                  longDesc:
                    'The internal ID of the inventory item, non-inventory item, service, or other item type in NetSuite that is being ordered.',
                },
                quantity: {
                  displayName: 'Quantity',
                  shortDesc: 'Number of units',
                  longDesc:
                    'The number of units being ordered for this line item. For services, this is typically hours or days.',
                },
                amount: {
                  displayName: 'Amount Override',
                  shortDesc: 'Custom price (optional)',
                  longDesc:
                    'Optional custom price override for this line item. If provided, overrides the standard price calculation (quantity × rate). Leave empty to use standard pricing from the price level assigned to the customer.',
                },
              },
            },
          },
        },
      },
    },
    salesOrder_id_get: {
      groups: ['Sales & Billing'],
      displayName: 'Get Sales Order',
      shortDesc: 'Retrieve details of a specific sales order.',
      longDesc: 'Fetches detailed information of a single sales order by its ID.',
    },
    salesOrder_id_patch: {
      groups: ['Sales & Billing'],
      displayName: 'Update Sales Order',
      shortDesc: 'Updates an existing sales order.',
      longDesc: 'Allows the user to update details of a specific sales order by its ID.',
      options: {
        entity: {
          displayName: 'Customer',
          shortDesc: 'The customer for the sales order',
          longDesc: 'The customer for the sales order ',
        },
      },
    },
    salesOrder_id_delete: {
      groups: ['Sales & Billing'],
      displayName: 'Delete Sales Order',
      shortDesc: 'Deletes a specific sales order.',
      longDesc: 'Removes a sales order record from NetSuite based on its ID.',
    },
    vendor_get: {
      groups: ['Procurement'],
      displayName: 'Get List of Vendors',
      shortDesc: 'Retrieve a list of vendors.',
      longDesc: 'Fetches a list of vendors based on specified filters.',
    },
    vendor_post: {
      groups: ['Procurement'],
      displayName: 'Create Vendor',
      shortDesc: 'Creates a new vendor.',
      longDesc: 'Allows the user to create a new vendor record in NetSuite.',
    },
    vendor_id_get: {
      groups: ['Procurement'],
      displayName: 'Get Vendor',
      shortDesc: 'Retrieve details of a specific vendor.',
      longDesc: 'Fetches detailed information of a single vendor by its ID.',
    },
    vendor_id_patch: {
      groups: ['Procurement'],
      displayName: 'Update Vendor',
      shortDesc: 'Updates an existing vendor.',
      longDesc: 'Allows the user to update details of a specific vendor by its ID.',
    },
    vendor_id_delete: {
      groups: ['Procurement'],
      displayName: 'Delete Vendor',
      shortDesc: 'Deletes a specific vendor.',
      longDesc: 'Removes a vendor record from NetSuite based on its ID.',
    },
  },
  expressions: {
    '&&': {
      displayName: 'And',
      shortDesc: 'Logical AND operator',
      longDesc: 'Combines multiple conditions where all must be true',
    },
    '||': {
      displayName: 'Or',
      shortDesc: 'Logical OR operator',
      longDesc: 'Combines multiple conditions where at least one must be true',
    },
    '==': {
      displayName: 'Equals',
      shortDesc: 'Field equals value',
      longDesc: 'Matches records where the field equals the specified value',
    },
    '!=': {
      displayName: 'Not Equals',
      shortDesc: 'Field does not equal value',
      longDesc: 'Matches records where the field does not equal the specified value',
    },
    '>': {
      displayName: 'Greater Than',
      shortDesc: 'Field is greater than value',
      longDesc: 'Matches records where the field value is greater than the specified value',
    },
    '>=': {
      displayName: 'Greater Than or Equal',
      shortDesc: 'Field is greater than or equal to value',
      longDesc: 'Matches records where the field value is greater than or equal to the specified value',
    },
    '<': {
      displayName: 'Less Than',
      shortDesc: 'Field is less than value',
      longDesc: 'Matches records where the field value is less than the specified value',
    },
    '<=': {
      displayName: 'Less Than or Equal',
      shortDesc: 'Field is less than or equal to value',
      longDesc: 'Matches records where the field value is less than or equal to the specified value',
    },
    'is-set': {
      displayName: 'Is Set',
      shortDesc: 'Field has a value',
      longDesc: 'Matches records where the field has a value (is not null)',
    },
    'is-not-set': {
      displayName: 'Is Not Set',
      shortDesc: 'Field has no value',
      longDesc: 'Matches records where the field has no value (is null)',
    },
    contains: {
      displayName: 'Contains',
      shortDesc: 'Field contains value',
      longDesc: 'Matches records where the field contains the specified substring',
    },
    'starts-with': {
      displayName: 'Starts With',
      shortDesc: 'Field starts with value',
      longDesc: 'Matches records where the field value starts with the specified prefix',
    },
    'ends-with': {
      displayName: 'Ends With',
      shortDesc: 'Field ends with value',
      longDesc: 'Matches records where the field value ends with the specified suffix',
    },
  },
  searchOptions: {
    orderBy: {
      displayName: 'Order By',
      shortDesc: 'Sort results by a specific field',
      longDesc: 'Define the field and direction to sort search results',
      type: {
        fields: {
          field: {
            displayName: 'Field',
            shortDesc: 'The field to sort by',
            longDesc: 'The name of the field to use for sorting results',
          },
          direction: {
            displayName: 'Direction',
            shortDesc: 'Sort direction',
            longDesc: 'The direction to sort results (ascending or descending)',
          },
        },
      },
    },
  },
};

export default NetSuiteAppEn;
