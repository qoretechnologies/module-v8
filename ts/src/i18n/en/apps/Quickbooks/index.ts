/* eslint-disable max-len */
const QuickbooksAppEn = {
  displayName: 'QuickBooks',
  groups: ['Accounting & ERP'],
  shortDesc: 'Integrate with QuickBooks Online for accounting and financial management',
  longDesc:
    'Connect to QuickBooks Online to manage customers, vendors, items, invoices, payments, and financial reports. Automate your accounting workflows and keep your financial data synchronized.',
  actions: {
    list_accounts: {
      displayName: 'List Accounts',
      shortDesc: 'Retrieve a list of accounts from QuickBooks',
      longDesc:
        'Fetch multiple accounts from QuickBooks with optional filtering, sorting, and pagination capabilities',
      options: {
        fetchAll: {
          displayName: 'Fetch All',
          shortDesc: 'Retrieve all accounts without pagination',
          longDesc: 'When enabled, fetches all accounts ignoring limit and offset parameters',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of accounts to retrieve',
          longDesc: 'The maximum number of accounts to return in a single request (default: 50)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of accounts to skip',
          longDesc: 'The number of accounts to skip before starting to return results (default: 0)',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for accounts',
          longDesc:
            'Apply filtering to narrow down the list of accounts based on specific field values',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to filter on',
                longDesc: 'The account field to apply the filter criteria to',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'The operator to use for comparing the field value (e.g., =, !=, <, >)',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The value to compare against the specified field',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort criteria for accounts',
          longDesc: 'Specify how to sort the returned accounts list',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'The field to sort by',
                longDesc: 'The account field to use for sorting the results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'The sort direction',
                longDesc: 'Whether to sort in ascending or descending order',
              },
            },
          },
        },
      },
    },
    get_account: {
      displayName: 'Get Account',
      shortDesc: 'Retrieve a specific account from QuickBooks',
      longDesc: 'Fetch detailed information about a specific account using its ID',
      options: {
        id: {
          displayName: 'Account ID',
          shortDesc: 'The unique identifier of the account',
          longDesc: 'The QuickBooks account ID to retrieve detailed information for',
        },
      },
    },
    get_bill: {
      displayName: 'Get Bill',
      shortDesc: 'Retrieve a specific bill from QuickBooks',
      longDesc: 'Fetch detailed information about a specific bill using its ID',
      options: {
        id: {
          displayName: 'Bill ID',
          shortDesc: 'The unique identifier of the bill',
          longDesc: 'The QuickBooks bill ID to retrieve detailed information for',
        },
      },
    },
    list_bills: {
      displayName: 'List Bills',
      shortDesc: 'Retrieve a list of bills from QuickBooks',
      longDesc:
        'Fetch multiple bills from QuickBooks with optional filtering, sorting, and pagination capabilities',
      options: {
        fetchAll: {
          displayName: 'Fetch All',
          shortDesc: 'Retrieve all bills without pagination',
          longDesc: 'When enabled, fetches all bills ignoring limit and offset parameters',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of bills to retrieve',
          longDesc: 'The maximum number of bills to return in a single request (default: 50)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of bills to skip',
          longDesc: 'The number of bills to skip before starting to return results (default: 0)',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for bills',
          longDesc:
            'Apply filtering to narrow down the list of bills based on specific field values',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to filter on',
                longDesc: 'The bill field to apply the filter criteria to',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'The operator to use for comparing the field value (e.g., =, !=, <, >)',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The value to compare against the specified field',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort criteria for bills',
          longDesc: 'Specify how to sort the returned bills list',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'The field to sort by',
                longDesc: 'The bill field to use for sorting the results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'The sort direction',
                longDesc: 'Whether to sort in ascending or descending order',
              },
            },
          },
        },
      },
    },
    update_bill: {
      displayName: 'Update Bill',
      shortDesc: 'Update an existing bill in QuickBooks',
      longDesc:
        'Modify an existing bill with new vendor information, line items, and other details',
      options: {
        bill_id: {
          displayName: 'Bill ID',
          shortDesc: 'The unique identifier of the bill to update',
          longDesc: 'The QuickBooks bill ID that you want to update',
        },
        vendor_id: {
          displayName: 'Vendor ID',
          shortDesc: 'The vendor associated with the bill',
          longDesc: 'The unique identifier of the vendor who issued the bill',
        },
        line_item_type: {
          displayName: 'Line Item Type',
          shortDesc: 'The type of line items for the bill',
          longDesc: 'Choose between account-based or item-based expense line details for the bill',
        },
        line_items: {
          displayName: 'Line Items',
          shortDesc: 'List of line items for the bill',
          longDesc: 'The detailed list of expenses or items included in the bill',
          type: {
            element_type: {
              fields: {
                amount: {
                  displayName: 'Amount',
                  shortDesc: 'The amount for this line item',
                  longDesc: 'The monetary amount for this specific line item',
                },
                description: {
                  displayName: 'Description',
                  shortDesc: 'Description of the line item',
                  longDesc: 'A detailed description of what this line item represents',
                },
                tax_code_id: {
                  displayName: 'Tax Code ID',
                  shortDesc: 'The tax code for this line item',
                  longDesc: 'The unique identifier of the tax code to apply to this line item',
                },
                class_id: {
                  displayName: 'Class ID',
                  shortDesc: 'The class for this line item',
                  longDesc: 'The unique identifier of the class to categorize this line item',
                },
                customer_id: {
                  displayName: 'Customer ID',
                  shortDesc: 'The customer for this line item',
                  longDesc: 'The unique identifier of the customer if this expense is billable',
                },
                billable_status: {
                  displayName: 'Billable Status',
                  shortDesc: 'Whether this line item is billable',
                  longDesc: 'Indicates if this expense can be billed to a customer',
                },
                account_id: {
                  displayName: 'Account ID',
                  shortDesc: 'The account for this expense',
                  longDesc: 'The unique identifier of the account to categorize this expense',
                },
                item_id: {
                  displayName: 'Item ID',
                  shortDesc: 'The item for this line',
                  longDesc: 'The unique identifier of the item being purchased',
                },
                quantity: {
                  displayName: 'Quantity',
                  shortDesc: 'The quantity of the item',
                  longDesc: 'The number of units of the item being purchased',
                },
                unit_price: {
                  displayName: 'Unit Price',
                  shortDesc: 'The price per unit',
                  longDesc: 'The cost per individual unit of the item',
                },
              },
            },
          },
        },
      },
    },
    create_bill: {
      displayName: 'Create Bill',
      shortDesc: 'Create a new bill in QuickBooks',
      longDesc:
        'Create a new bill with vendor information, line items, and other necessary details',
      options: {
        vendor_id: {
          displayName: 'Vendor ID',
          shortDesc: 'The vendor issuing the bill',
          longDesc: 'The unique identifier of the vendor who is issuing this bill',
        },
        line_item_type: {
          displayName: 'Line Item Type',
          shortDesc: 'The type of line items for the bill',
          longDesc: 'Choose between account-based or item-based expense line details for the bill',
        },
        line_items: {
          displayName: 'Line Items',
          shortDesc: 'List of line items for the bill',
          longDesc: 'The detailed list of expenses or items included in the bill',
          type: {
            element_type: {
              fields: {
                amount: {
                  displayName: 'Amount',
                  shortDesc: 'The amount for this line item',
                  longDesc: 'The monetary amount for this specific line item',
                },
                description: {
                  displayName: 'Description',
                  shortDesc: 'Description of the line item',
                  longDesc: 'A detailed description of what this line item represents',
                },
                tax_code_id: {
                  displayName: 'Tax Code ID',
                  shortDesc: 'The tax code for this line item',
                  longDesc: 'The unique identifier of the tax code to apply to this line item',
                },
                class_id: {
                  displayName: 'Class ID',
                  shortDesc: 'The class for this line item',
                  longDesc: 'The unique identifier of the class to categorize this line item',
                },
                customer_id: {
                  displayName: 'Customer ID',
                  shortDesc: 'The customer for this line item',
                  longDesc: 'The unique identifier of the customer if this expense is billable',
                },
                billable_status: {
                  displayName: 'Billable Status',
                  shortDesc: 'Whether this line item is billable',
                  longDesc: 'Indicates if this expense can be billed to a customer',
                },
                account_id: {
                  displayName: 'Account ID',
                  shortDesc: 'The account for this expense',
                  longDesc: 'The unique identifier of the account to categorize this expense',
                },
                item_id: {
                  displayName: 'Item ID',
                  shortDesc: 'The item for this line',
                  longDesc: 'The unique identifier of the item being purchased',
                },
                quantity: {
                  displayName: 'Quantity',
                  shortDesc: 'The quantity of the item',
                  longDesc: 'The number of units of the item being purchased',
                },
                unit_price: {
                  displayName: 'Unit Price',
                  shortDesc: 'The price per unit',
                  longDesc: 'The cost per individual unit of the item',
                },
              },
            },
          },
        },
      },
    },
    delete_bill: {
      displayName: 'Delete Bill',
      shortDesc: 'Delete a bill from QuickBooks',
      longDesc: 'Permanently remove a bill from QuickBooks using its unique identifier',
      options: {
        id: {
          displayName: 'Bill ID',
          shortDesc: 'The unique identifier of the bill to delete',
          longDesc: 'The QuickBooks bill ID that you want to permanently remove',
        },
      },
    },
    get_credit_memo: {
      displayName: 'Get Credit Memo',
      shortDesc: 'Retrieve a specific credit memo from QuickBooks',
      longDesc: 'Fetch detailed information about a specific credit memo using its ID',
      options: {
        id: {
          displayName: 'Credit Memo ID',
          shortDesc: 'The unique identifier of the credit memo',
          longDesc: 'The QuickBooks credit memo ID to retrieve detailed information for',
        },
      },
    },
    list_credit_memos: {
      displayName: 'List Credit Memos',
      shortDesc: 'Retrieve a list of credit memos from QuickBooks',
      longDesc:
        'Fetch multiple credit memos from QuickBooks with optional filtering, sorting, and pagination capabilities',
      options: {
        fetchAll: {
          displayName: 'Fetch All',
          shortDesc: 'Retrieve all credit memos without pagination',
          longDesc: 'When enabled, fetches all credit memos ignoring limit and offset parameters',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of credit memos to retrieve',
          longDesc:
            'The maximum number of credit memos to return in a single request (default: 50)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of credit memos to skip',
          longDesc:
            'The number of credit memos to skip before starting to return results (default: 0)',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for credit memos',
          longDesc:
            'Apply filtering to narrow down the list of credit memos based on specific field values',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to filter on',
                longDesc: 'The credit memo field to apply the filter criteria to',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'The operator to use for comparing the field value (e.g., =, !=, <, >)',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The value to compare against the specified field',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort criteria for credit memos',
          longDesc: 'Specify how to sort the returned credit memos list',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'The field to sort by',
                longDesc: 'The credit memo field to use for sorting the results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'The sort direction',
                longDesc: 'Whether to sort in ascending or descending order',
              },
            },
          },
        },
      },
    },
    create_customer: {
      displayName: 'Create Customer',
      shortDesc: 'Create a new customer in QuickBooks',
      longDesc:
        'Create a new customer record with personal information, contact details, and addresses',
      options: {
        display_name: {
          displayName: 'Display Name',
          shortDesc: 'The display name for the customer',
          longDesc: 'The name that will be displayed for this customer in QuickBooks',
        },
        given_name: {
          displayName: 'Given Name',
          shortDesc: 'The first name of the customer',
          longDesc: "The customer's first name or given name",
        },
        middle_name: {
          displayName: 'Middle Name',
          shortDesc: 'The middle name of the customer',
          longDesc: "The customer's middle name or middle initial",
        },
        family_name: {
          displayName: 'Family Name',
          shortDesc: 'The last name of the customer',
          longDesc: "The customer's last name or family name",
        },
        title: {
          displayName: 'Title',
          shortDesc: 'The title of the customer',
          longDesc: "The customer's title (e.g., Mr., Mrs., Dr., etc.)",
        },
        suffix: {
          displayName: 'Suffix',
          shortDesc: 'The suffix of the customer',
          longDesc: "The customer's suffix (e.g., Jr., Sr., III, etc.)",
        },
        company_name: {
          displayName: 'Company Name',
          shortDesc: 'The company name of the customer',
          longDesc: 'The name of the company the customer represents',
        },
        email: {
          displayName: 'Email',
          shortDesc: 'The email address of the customer',
          longDesc: 'The primary email address for the customer',
        },
        billing_address: {
          displayName: 'Billing Address',
          shortDesc: 'The billing address of the customer',
          longDesc: 'The address where bills should be sent for this customer',
          type: {
            fields: {
              Line1: {
                displayName: 'Address Line 1',
                shortDesc: 'The first line of the billing address',
                longDesc: 'The street address or P.O. box number',
              },
              Line2: {
                displayName: 'Address Line 2',
                shortDesc: 'The second line of the billing address',
                longDesc: 'Additional address information like apartment or suite number',
              },
              City: {
                displayName: 'City',
                shortDesc: 'The city of the billing address',
                longDesc: 'The city where the customer is located',
              },
              PostalCode: {
                displayName: 'Postal Code',
                shortDesc: 'The postal code of the billing address',
                longDesc: 'The ZIP code or postal code for the billing address',
              },
              CountrySubDivisionCode: {
                displayName: 'State/Province',
                shortDesc: 'The state or province code',
                longDesc: 'The state or province abbreviation (e.g., CA, NY, ON)',
              },
              Country: {
                displayName: 'Country',
                shortDesc: 'The country of the billing address',
                longDesc: 'The country where the customer is located',
              },
            },
          },
        },
        shipping_address: {
          displayName: 'Shipping Address',
          shortDesc: 'The shipping address of the customer',
          longDesc: 'The address where products should be shipped for this customer',
          type: {
            fields: {
              Line1: {
                displayName: 'Address Line 1',
                shortDesc: 'The first line of the shipping address',
                longDesc: 'The street address or P.O. box number',
              },
              Line2: {
                displayName: 'Address Line 2',
                shortDesc: 'The second line of the shipping address',
                longDesc: 'Additional address information like apartment or suite number',
              },
              City: {
                displayName: 'City',
                shortDesc: 'The city of the shipping address',
                longDesc: 'The city where products should be shipped',
              },
              PostalCode: {
                displayName: 'Postal Code',
                shortDesc: 'The postal code of the shipping address',
                longDesc: 'The ZIP code or postal code for the shipping address',
              },
              CountrySubDivisionCode: {
                displayName: 'State/Province',
                shortDesc: 'The state or province code',
                longDesc: 'The state or province abbreviation (e.g., CA, NY, ON)',
              },
              Country: {
                displayName: 'Country',
                shortDesc: 'The country of the shipping address',
                longDesc: 'The country where products should be shipped',
              },
            },
          },
        },
      },
    },
    get_customer: {
      displayName: 'Get Customer',
      shortDesc: 'Retrieve a specific customer from QuickBooks',
      longDesc: 'Fetch detailed information about a specific customer using their ID',
      options: {
        id: {
          displayName: 'Customer ID',
          shortDesc: 'The unique identifier of the customer',
          longDesc: 'The QuickBooks customer ID to retrieve detailed information for',
        },
      },
    },
    list_customers: {
      displayName: 'List Customers',
      shortDesc: 'Retrieve a list of customers from QuickBooks',
      longDesc:
        'Fetch multiple customers from QuickBooks with optional filtering, sorting, and pagination capabilities',
      options: {
        fetchAll: {
          displayName: 'Fetch All',
          shortDesc: 'Retrieve all customers without pagination',
          longDesc: 'When enabled, fetches all customers ignoring limit and offset parameters',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of customers to retrieve',
          longDesc: 'The maximum number of customers to return in a single request (default: 50)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of customers to skip',
          longDesc:
            'The number of customers to skip before starting to return results (default: 0)',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for customers',
          longDesc:
            'Apply filtering to narrow down the list of customers based on specific field values',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to filter on',
                longDesc: 'The customer field to apply the filter criteria to',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'The operator to use for comparing the field value (e.g., =, !=, <, >)',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The value to compare against the specified field',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort criteria for customers',
          longDesc: 'Specify how to sort the returned customers list',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'The field to sort by',
                longDesc: 'The customer field to use for sorting the results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'The sort direction',
                longDesc: 'Whether to sort in ascending or descending order',
              },
            },
          },
        },
      },
    },
    update_customer: {
      displayName: 'Update Customer',
      shortDesc: 'Update an existing customer in QuickBooks',
      longDesc:
        'Modify an existing customer record with updated personal information, contact details, and addresses',
      options: {
        customer_id: {
          displayName: 'Customer ID',
          shortDesc: 'The unique identifier of the customer to update',
          longDesc: 'The QuickBooks customer ID that you want to update',
        },
        display_name: {
          displayName: 'Display Name',
          shortDesc: 'The display name for the customer',
          longDesc: 'The name that will be displayed for this customer in QuickBooks',
        },
        given_name: {
          displayName: 'Given Name',
          shortDesc: 'The first name of the customer',
          longDesc: "The customer's first name or given name",
        },
        middle_name: {
          displayName: 'Middle Name',
          shortDesc: 'The middle name of the customer',
          longDesc: "The customer's middle name or middle initial",
        },
        family_name: {
          displayName: 'Family Name',
          shortDesc: 'The last name of the customer',
          longDesc: "The customer's last name or family name",
        },
        title: {
          displayName: 'Title',
          shortDesc: 'The title of the customer',
          longDesc: "The customer's title (e.g., Mr., Mrs., Dr., etc.)",
        },
        suffix: {
          displayName: 'Suffix',
          shortDesc: 'The suffix of the customer',
          longDesc: "The customer's suffix (e.g., Jr., Sr., III, etc.)",
        },
        company_name: {
          displayName: 'Company Name',
          shortDesc: 'The company name of the customer',
          longDesc: 'The name of the company the customer represents',
        },
        email: {
          displayName: 'Email',
          shortDesc: 'The email address of the customer',
          longDesc: 'The primary email address for the customer',
        },
        billing_address: {
          displayName: 'Billing Address',
          shortDesc: 'The billing address of the customer',
          longDesc: 'The address where bills should be sent for this customer',
          type: {
            fields: {
              Line1: {
                displayName: 'Address Line 1',
                shortDesc: 'The first line of the billing address',
                longDesc: 'The street address or P.O. box number',
              },
              Line2: {
                displayName: 'Address Line 2',
                shortDesc: 'The second line of the billing address',
                longDesc: 'Additional address information like apartment or suite number',
              },
              City: {
                displayName: 'City',
                shortDesc: 'The city of the billing address',
                longDesc: 'The city where the customer is located',
              },
              PostalCode: {
                displayName: 'Postal Code',
                shortDesc: 'The postal code of the billing address',
                longDesc: 'The ZIP code or postal code for the billing address',
              },
              CountrySubDivisionCode: {
                displayName: 'State/Province',
                shortDesc: 'The state or province code',
                longDesc: 'The state or province abbreviation (e.g., CA, NY, ON)',
              },
              Country: {
                displayName: 'Country',
                shortDesc: 'The country of the billing address',
                longDesc: 'The country where the customer is located',
              },
            },
          },
        },
        shipping_address: {
          displayName: 'Shipping Address',
          shortDesc: 'The shipping address of the customer',
          longDesc: 'The address where products should be shipped for this customer',
          type: {
            fields: {
              Line1: {
                displayName: 'Address Line 1',
                shortDesc: 'The first line of the shipping address',
                longDesc: 'The street address or P.O. box number',
              },
              Line2: {
                displayName: 'Address Line 2',
                shortDesc: 'The second line of the shipping address',
                longDesc: 'Additional address information like apartment or suite number',
              },
              City: {
                displayName: 'City',
                shortDesc: 'The city of the shipping address',
                longDesc: 'The city where products should be shipped',
              },
              PostalCode: {
                displayName: 'Postal Code',
                shortDesc: 'The postal code of the shipping address',
                longDesc: 'The ZIP code or postal code for the shipping address',
              },
              CountrySubDivisionCode: {
                displayName: 'State/Province',
                shortDesc: 'The state or province code',
                longDesc: 'The state or province abbreviation (e.g., CA, NY, ON)',
              },
              Country: {
                displayName: 'Country',
                shortDesc: 'The country of the shipping address',
                longDesc: 'The country where products should be shipped',
              },
            },
          },
        },
      },
    },
    get_deposit: {
      displayName: 'Get Deposit',
      shortDesc: 'Retrieve a specific deposit from QuickBooks',
      longDesc: 'Fetch detailed information about a specific deposit using its ID',
      options: {
        id: {
          displayName: 'Deposit ID',
          shortDesc: 'The unique identifier of the deposit',
          longDesc: 'The QuickBooks deposit ID to retrieve detailed information for',
        },
      },
    },
    list_deposits: {
      displayName: 'List Deposits',
      shortDesc: 'Retrieve a list of deposits from QuickBooks',
      longDesc:
        'Fetch multiple deposits from QuickBooks with optional filtering, sorting, and pagination capabilities',
      options: {
        fetchAll: {
          displayName: 'Fetch All',
          shortDesc: 'Retrieve all deposits without pagination',
          longDesc: 'When enabled, fetches all deposits ignoring limit and offset parameters',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of deposits to retrieve',
          longDesc: 'The maximum number of deposits to return in a single request (default: 50)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of deposits to skip',
          longDesc: 'The number of deposits to skip before starting to return results (default: 0)',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for deposits',
          longDesc:
            'Apply filtering to narrow down the list of deposits based on specific field values',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to filter on',
                longDesc: 'The deposit field to apply the filter criteria to',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'The operator to use for comparing the field value (e.g., =, !=, <, >)',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The value to compare against the specified field',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort criteria for deposits',
          longDesc: 'Specify how to sort the returned deposits list',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'The field to sort by',
                longDesc: 'The deposit field to use for sorting the results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'The sort direction',
                longDesc: 'Whether to sort in ascending or descending order',
              },
            },
          },
        },
      },
    },
    create_estimate: {
      displayName: 'Create Estimate',
      shortDesc: 'Create a new estimate in QuickBooks',
      longDesc:
        'Create a new estimate for a customer with line items, quantities, and pricing information',
      options: {
        customer_id: {
          displayName: 'Customer ID',
          shortDesc: 'The customer for this estimate',
          longDesc: 'The unique identifier of the customer who will receive this estimate',
        },
        lines: {
          displayName: 'Line Items',
          shortDesc: 'List of line items for the estimate',
          longDesc: 'The detailed list of items or services included in the estimate',
          type: {
            element_type: {
              fields: {
                amount: {
                  displayName: 'Amount',
                  shortDesc: 'The amount for this line item',
                  longDesc: 'The total monetary amount for this specific line item',
                },
                description: {
                  displayName: 'Description',
                  shortDesc: 'Description of the line item',
                  longDesc: 'A detailed description of what this line item represents',
                },
                quantity: {
                  displayName: 'Quantity',
                  shortDesc: 'The quantity of the item',
                  longDesc: 'The number of units of the item being estimated',
                },
                unit_price: {
                  displayName: 'Unit Price',
                  shortDesc: 'The price per unit',
                  longDesc: 'The cost per individual unit of the item',
                },
                item_id: {
                  displayName: 'Item ID',
                  shortDesc: 'The item for this line',
                  longDesc: 'The unique identifier of the item being estimated',
                },
                service_date: {
                  displayName: 'Service Date',
                  shortDesc: 'The date when the service will be provided',
                  longDesc: 'The specific date when the service or item will be delivered',
                },
                tax_code_id: {
                  displayName: 'Tax Code ID',
                  shortDesc: 'The tax code for this line item',
                  longDesc: 'The unique identifier of the tax code to apply to this line item',
                },
                class_id: {
                  displayName: 'Class ID',
                  shortDesc: 'The class for this line item',
                  longDesc: 'The unique identifier of the class to categorize this line item',
                },
              },
            },
          },
        },
      },
    },
    delete_estimate: {
      displayName: 'Delete Estimate',
      shortDesc: 'Delete an estimate from QuickBooks',
      longDesc: 'Permanently remove an estimate from QuickBooks using its unique identifier',
      options: {
        id: {
          displayName: 'Estimate ID',
          shortDesc: 'The unique identifier of the estimate to delete',
          longDesc: 'The QuickBooks estimate ID that you want to permanently remove',
        },
      },
    },
    get_estimate: {
      displayName: 'Get Estimate',
      shortDesc: 'Retrieve a specific estimate from QuickBooks',
      longDesc: 'Fetch detailed information about a specific estimate using its ID',
      options: {
        id: {
          displayName: 'Estimate ID',
          shortDesc: 'The unique identifier of the estimate',
          longDesc: 'The QuickBooks estimate ID to retrieve detailed information for',
        },
      },
    },
    list_estimates: {
      displayName: 'List Estimates',
      shortDesc: 'Retrieve a list of estimates from QuickBooks',
      longDesc:
        'Fetch multiple estimates from QuickBooks with optional filtering, sorting, and pagination capabilities',
      options: {
        fetchAll: {
          displayName: 'Fetch All',
          shortDesc: 'Retrieve all estimates without pagination',
          longDesc: 'When enabled, fetches all estimates ignoring limit and offset parameters',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of estimates to retrieve',
          longDesc: 'The maximum number of estimates to return in a single request (default: 50)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of estimates to skip',
          longDesc:
            'The number of estimates to skip before starting to return results (default: 0)',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for estimates',
          longDesc:
            'Apply filtering to narrow down the list of estimates based on specific field values',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to filter on',
                longDesc: 'The estimate field to apply the filter criteria to',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'The operator to use for comparing the field value (e.g., =, !=, <, >)',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The value to compare against the specified field',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort criteria for estimates',
          longDesc: 'Specify how to sort the returned estimates list',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'The field to sort by',
                longDesc: 'The estimate field to use for sorting the results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'The sort direction',
                longDesc: 'Whether to sort in ascending or descending order',
              },
            },
          },
        },
      },
    },
    create_invoice: {
      displayName: 'Create Invoice',
      shortDesc: 'Create a new invoice in QuickBooks',
      longDesc:
        'Create a new invoice for a customer with line items, quantities, and pricing information',
      options: {
        customer: {
          displayName: 'Customer',
          shortDesc: 'The customer for this invoice',
          longDesc: 'The unique identifier of the customer who will receive this invoice',
        },
        lines: {
          displayName: 'Line Items',
          shortDesc: 'List of line items for the invoice',
          longDesc: 'The detailed list of items or services included in the invoice',
          type: {
            element_type: {
              fields: {
                amount: {
                  displayName: 'Amount',
                  shortDesc: 'The amount for this line item',
                  longDesc: 'The total monetary amount for this specific line item',
                },
                description: {
                  displayName: 'Description',
                  shortDesc: 'Description of the line item',
                  longDesc: 'A detailed description of what this line item represents',
                },
                quantity: {
                  displayName: 'Quantity',
                  shortDesc: 'The quantity of the item',
                  longDesc: 'The number of units of the item being invoiced',
                },
                unit_price: {
                  displayName: 'Unit Price',
                  shortDesc: 'The price per unit',
                  longDesc: 'The cost per individual unit of the item',
                },
                item_id: {
                  displayName: 'Item ID',
                  shortDesc: 'The item for this line',
                  longDesc: 'The unique identifier of the item being invoiced',
                },
                service_date: {
                  displayName: 'Service Date',
                  shortDesc: 'The date when the service was provided',
                  longDesc: 'The specific date when the service or item was delivered',
                },
                tax_code_id: {
                  displayName: 'Tax Code ID',
                  shortDesc: 'The tax code for this line item',
                  longDesc: 'The unique identifier of the tax code to apply to this line item',
                },
                class_id: {
                  displayName: 'Class ID',
                  shortDesc: 'The class for this line item',
                  longDesc: 'The unique identifier of the class to categorize this line item',
                },
              },
            },
          },
        },
      },
    },
    delete_invoice: {
      displayName: 'Delete Invoice',
      shortDesc: 'Delete an invoice from QuickBooks',
      longDesc: 'Permanently remove an invoice from QuickBooks using its unique identifier',
      options: {
        id: {
          displayName: 'Invoice ID',
          shortDesc: 'The unique identifier of the invoice to delete',
          longDesc: 'The QuickBooks invoice ID that you want to permanently remove',
        },
      },
    },
    get_invoice: {
      displayName: 'Get Invoice',
      shortDesc: 'Retrieve a specific invoice from QuickBooks',
      longDesc: 'Fetch detailed information about a specific invoice using its ID',
      options: {
        id: {
          displayName: 'Invoice ID',
          shortDesc: 'The unique identifier of the invoice',
          longDesc: 'The QuickBooks invoice ID to retrieve detailed information for',
        },
      },
    },
    list_invoices: {
      displayName: 'List Invoices',
      shortDesc: 'Retrieve a list of invoices from QuickBooks',
      longDesc:
        'Fetch multiple invoices from QuickBooks with optional filtering, sorting, and pagination capabilities',
      options: {
        fetchAll: {
          displayName: 'Fetch All',
          shortDesc: 'Retrieve all invoices without pagination',
          longDesc: 'When enabled, fetches all invoices ignoring limit and offset parameters',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of invoices to retrieve',
          longDesc: 'The maximum number of invoices to return in a single request (default: 50)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of invoices to skip',
          longDesc: 'The number of invoices to skip before starting to return results (default: 0)',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for invoices',
          longDesc:
            'Apply filtering to narrow down the list of invoices based on specific field values',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to filter on',
                longDesc: 'The invoice field to apply the filter criteria to',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'The operator to use for comparing the field value (e.g., =, !=, <, >)',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The value to compare against the specified field',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort criteria for invoices',
          longDesc: 'Specify how to sort the returned invoices list',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'The field to sort by',
                longDesc: 'The invoice field to use for sorting the results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'The sort direction',
                longDesc: 'Whether to sort in ascending or descending order',
              },
            },
          },
        },
      },
    },
    update_invoice: {
      displayName: 'Update Invoice',
      shortDesc: 'Update an existing invoice in QuickBooks',
      longDesc:
        'Modify an existing invoice with updated customer information, line items, and other details',
      options: {
        invoice_id: {
          displayName: 'Invoice ID',
          shortDesc: 'The unique identifier of the invoice to update',
          longDesc: 'The QuickBooks invoice ID that you want to update',
        },
        customer: {
          displayName: 'Customer',
          shortDesc: 'The customer for this invoice',
          longDesc: 'The unique identifier of the customer who will receive this invoice',
        },
        lines: {
          displayName: 'Line Items',
          shortDesc: 'List of line items for the invoice',
          longDesc: 'The detailed list of items or services included in the invoice',
          type: {
            element_type: {
              fields: {
                amount: {
                  displayName: 'Amount',
                  shortDesc: 'The amount for this line item',
                  longDesc: 'The total monetary amount for this specific line item',
                },
                description: {
                  displayName: 'Description',
                  shortDesc: 'Description of the line item',
                  longDesc: 'A detailed description of what this line item represents',
                },
                quantity: {
                  displayName: 'Quantity',
                  shortDesc: 'The quantity of the item',
                  longDesc: 'The number of units of the item being invoiced',
                },
                unit_price: {
                  displayName: 'Unit Price',
                  shortDesc: 'The price per unit',
                  longDesc: 'The cost per individual unit of the item',
                },
                item_id: {
                  displayName: 'Item ID',
                  shortDesc: 'The item for this line',
                  longDesc: 'The unique identifier of the item being invoiced',
                },
                service_date: {
                  displayName: 'Service Date',
                  shortDesc: 'The date when the service was provided',
                  longDesc: 'The specific date when the service or item was delivered',
                },
                tax_code_id: {
                  displayName: 'Tax Code ID',
                  shortDesc: 'The tax code for this line item',
                  longDesc: 'The unique identifier of the tax code to apply to this line item',
                },
                class_id: {
                  displayName: 'Class ID',
                  shortDesc: 'The class for this line item',
                  longDesc: 'The unique identifier of the class to categorize this line item',
                },
              },
            },
          },
        },
      },
    },
    create_item: {
      displayName: 'Create Item',
      shortDesc: 'Create a new item in QuickBooks',
      longDesc:
        'Create a new item for products or services that can be used on invoices, estimates, and other transactions',
      options: {
        name: {
          displayName: 'Item Name',
          shortDesc: 'The name of the item',
          longDesc: 'The display name for this item as it will appear on transactions',
        },
        type: {
          displayName: 'Item Type',
          shortDesc: 'The type of item being created',
          longDesc:
            'Choose the type of item: Service (for services), NonInventory (for non-tracked products), or Inventory (for tracked products)',
        },
        income_account_id: {
          displayName: 'Income Account ID',
          shortDesc: 'The income account for this item',
          longDesc:
            'The unique identifier of the account that will be credited when this item is sold',
        },
        expense_account_id: {
          displayName: 'Expense Account ID',
          shortDesc: 'The expense account for this item',
          longDesc:
            'The unique identifier of the account that will be debited when this item is purchased',
        },
        account_id: {
          displayName: 'Asset Account ID',
          shortDesc: 'The asset account for inventory items',
          longDesc:
            'The unique identifier of the asset account used to track inventory value (required for Inventory items)',
        },
        quantity_on_hand: {
          displayName: 'Quantity On Hand',
          shortDesc: 'The initial quantity in stock',
          longDesc: 'The starting quantity of this inventory item that you currently have in stock',
        },
        track_quantity_on_hand: {
          displayName: 'Track Quantity On Hand',
          shortDesc: 'Whether to track inventory quantities',
          longDesc: 'Enable this to track the quantity of this inventory item in stock',
        },
        inventory_start_date: {
          displayName: 'Inventory Start Date',
          shortDesc: 'The date when inventory tracking begins',
          longDesc: 'The date from which inventory tracking for this item should begin',
        },
      },
    },
    get_item: {
      displayName: 'Get Item',
      shortDesc: 'Retrieve a specific item from QuickBooks',
      longDesc: 'Fetch detailed information about a specific item using its ID',
      options: {
        id: {
          displayName: 'Item ID',
          shortDesc: 'The unique identifier of the item',
          longDesc: 'The QuickBooks item ID to retrieve detailed information for',
        },
      },
    },
    list_items: {
      displayName: 'List Items',
      shortDesc: 'Retrieve a list of items from QuickBooks',
      longDesc:
        'Fetch multiple items from QuickBooks with optional filtering, sorting, and pagination capabilities',
      options: {
        fetchAll: {
          displayName: 'Fetch All',
          shortDesc: 'Retrieve all items without pagination',
          longDesc: 'When enabled, fetches all items ignoring limit and offset parameters',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of items to retrieve',
          longDesc: 'The maximum number of items to return in a single request (default: 50)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of items to skip',
          longDesc: 'The number of items to skip before starting to return results (default: 0)',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for items',
          longDesc:
            'Apply filtering to narrow down the list of items based on specific field values',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to filter on',
                longDesc: 'The item field to apply the filter criteria to',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'The operator to use for comparing the field value (e.g., =, !=, <, >)',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The value to compare against the specified field',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort criteria for items',
          longDesc: 'Specify how to sort the returned items list',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'The field to sort by',
                longDesc: 'The item field to use for sorting the results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'The sort direction',
                longDesc: 'Whether to sort in ascending or descending order',
              },
            },
          },
        },
      },
    },
    get_journal_entry: {
      displayName: 'Get Journal Entry',
      shortDesc: 'Retrieve a specific journal entry from QuickBooks',
      longDesc: 'Fetch detailed information about a specific journal entry using its ID',
      options: {
        id: {
          displayName: 'Journal Entry ID',
          shortDesc: 'The unique identifier of the journal entry',
          longDesc: 'The QuickBooks journal entry ID to retrieve detailed information for',
        },
      },
    },
    list_journal_entries: {
      displayName: 'List Journal Entries',
      shortDesc: 'Retrieve a list of journal entries from QuickBooks',
      longDesc:
        'Fetch multiple journal entries from QuickBooks with optional filtering, sorting, and pagination capabilities',
      options: {
        fetchAll: {
          displayName: 'Fetch All',
          shortDesc: 'Retrieve all journal entries without pagination',
          longDesc:
            'When enabled, fetches all journal entries ignoring limit and offset parameters',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of journal entries to retrieve',
          longDesc:
            'The maximum number of journal entries to return in a single request (default: 50)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of journal entries to skip',
          longDesc:
            'The number of journal entries to skip before starting to return results (default: 0)',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for journal entries',
          longDesc:
            'Apply filtering to narrow down the list of journal entries based on specific field values',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to filter on',
                longDesc: 'The journal entry field to apply the filter criteria to',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'The operator to use for comparing the field value (e.g., =, !=, <, >)',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The value to compare against the specified field',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort criteria for journal entries',
          longDesc: 'Specify how to sort the returned journal entries list',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'The field to sort by',
                longDesc: 'The journal entry field to use for sorting the results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'The sort direction',
                longDesc: 'Whether to sort in ascending or descending order',
              },
            },
          },
        },
      },
    },
    delete_payment: {
      displayName: 'Delete Payment',
      shortDesc: 'Delete a payment from QuickBooks',
      longDesc: 'Permanently remove a payment record from QuickBooks using its unique identifier',
      options: {
        id: {
          displayName: 'Payment ID',
          shortDesc: 'The unique identifier of the payment to delete',
          longDesc: 'The QuickBooks payment ID that you want to permanently remove',
        },
      },
    },
    get_payment: {
      displayName: 'Get Payment',
      shortDesc: 'Retrieve a specific payment from QuickBooks',
      longDesc: 'Fetch detailed information about a specific payment using its ID',
      options: {
        id: {
          displayName: 'Payment ID',
          shortDesc: 'The unique identifier of the payment',
          longDesc: 'The QuickBooks payment ID to retrieve detailed information for',
        },
      },
    },
    list_payments: {
      displayName: 'List Payments',
      shortDesc: 'Retrieve a list of payments from QuickBooks',
      longDesc:
        'Fetch multiple payments from QuickBooks with optional filtering, sorting, and pagination capabilities',
      options: {
        fetchAll: {
          displayName: 'Fetch All',
          shortDesc: 'Retrieve all payments without pagination',
          longDesc: 'When enabled, fetches all payments ignoring limit and offset parameters',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of payments to retrieve',
          longDesc: 'The maximum number of payments to return in a single request (default: 50)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of payments to skip',
          longDesc: 'The number of payments to skip before starting to return results (default: 0)',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for payments',
          longDesc:
            'Apply filtering to narrow down the list of payments based on specific field values',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to filter on',
                longDesc: 'The payment field to apply the filter criteria to',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'The operator to use for comparing the field value (e.g., =, !=, <, >)',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The value to compare against the specified field',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort criteria for payments',
          longDesc: 'Specify how to sort the returned payments list',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'The field to sort by',
                longDesc: 'The payment field to use for sorting the results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'The sort direction',
                longDesc: 'Whether to sort in ascending or descending order',
              },
            },
          },
        },
      },
    },
    get_purchase_order: {
      displayName: 'Get Purchase Order',
      shortDesc: 'Retrieve a specific purchase order from QuickBooks',
      longDesc: 'Fetch detailed information about a specific purchase order using its ID',
      options: {
        id: {
          displayName: 'Purchase Order ID',
          shortDesc: 'The unique identifier of the purchase order',
          longDesc: 'The QuickBooks purchase order ID to retrieve detailed information for',
        },
      },
    },
    get_purchase: {
      displayName: 'Get Purchase',
      shortDesc: 'Retrieve a specific purchase from QuickBooks',
      longDesc: 'Fetch detailed information about a specific purchase transaction using its ID',
      options: {
        id: {
          displayName: 'Purchase ID',
          shortDesc: 'The unique identifier of the purchase',
          longDesc: 'The QuickBooks purchase ID to retrieve detailed information for',
        },
      },
    },
    list_purchases: {
      displayName: 'List Purchases',
      shortDesc: 'Retrieve a list of purchases from QuickBooks',
      longDesc:
        'Fetch multiple purchases from QuickBooks with optional filtering, sorting, and pagination capabilities',
      options: {
        fetchAll: {
          displayName: 'Fetch All',
          shortDesc: 'Retrieve all purchases without pagination',
          longDesc: 'When enabled, fetches all purchases ignoring limit and offset parameters',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of purchases to retrieve',
          longDesc: 'The maximum number of purchases to return in a single request (default: 50)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of purchases to skip',
          longDesc:
            'The number of purchases to skip before starting to return results (default: 0)',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for purchases',
          longDesc:
            'Apply filtering to narrow down the list of purchases based on specific field values',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to filter on',
                longDesc: 'The purchase field to apply the filter criteria to',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'The operator to use for comparing the field value (e.g., =, !=, <, >)',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The value to compare against the specified field',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort criteria for purchases',
          longDesc: 'Specify how to sort the returned purchases list',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'The field to sort by',
                longDesc: 'The purchase field to use for sorting the results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'The sort direction',
                longDesc: 'Whether to sort in ascending or descending order',
              },
            },
          },
        },
      },
    },
    list_purchase_orders: {
      displayName: 'List Purchase Orders',
      shortDesc: 'Retrieve a list of purchase orders from QuickBooks',
      longDesc:
        'Fetch multiple purchase orders from QuickBooks with optional filtering, sorting, and pagination capabilities',
      options: {
        fetchAll: {
          displayName: 'Fetch All',
          shortDesc: 'Retrieve all purchase orders without pagination',
          longDesc:
            'When enabled, fetches all purchase orders ignoring limit and offset parameters',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of purchase orders to retrieve',
          longDesc:
            'The maximum number of purchase orders to return in a single request (default: 50)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of purchase orders to skip',
          longDesc:
            'The number of purchase orders to skip before starting to return results (default: 0)',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for purchase orders',
          longDesc:
            'Apply filtering to narrow down the list of purchase orders based on specific field values',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to filter on',
                longDesc: 'The purchase order field to apply the filter criteria to',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'The operator to use for comparing the field value (e.g., =, !=, <, >)',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The value to compare against the specified field',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort criteria for purchase orders',
          longDesc: 'Specify how to sort the returned purchase orders list',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'The field to sort by',
                longDesc: 'The purchase order field to use for sorting the results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'The sort direction',
                longDesc: 'Whether to sort in ascending or descending order',
              },
            },
          },
        },
      },
    },
    get_refund_receipt: {
      displayName: 'Get Refund Receipt',
      shortDesc: 'Retrieve a specific refund receipt from QuickBooks',
      longDesc: 'Fetch detailed information about a specific refund receipt using its ID',
      options: {
        id: {
          displayName: 'Refund Receipt ID',
          shortDesc: 'The unique identifier of the refund receipt',
          longDesc: 'The QuickBooks refund receipt ID to retrieve detailed information for',
        },
      },
    },
    list_refund_receipts: {
      displayName: 'List Refund Receipts',
      shortDesc: 'Retrieve a list of refund receipts from QuickBooks',
      longDesc:
        'Fetch multiple refund receipts from QuickBooks with optional filtering, sorting, and pagination capabilities',
      options: {
        fetchAll: {
          displayName: 'Fetch All',
          shortDesc: 'Retrieve all refund receipts without pagination',
          longDesc:
            'When enabled, fetches all refund receipts ignoring limit and offset parameters',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of refund receipts to retrieve',
          longDesc:
            'The maximum number of refund receipts to return in a single request (default: 50)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of refund receipts to skip',
          longDesc:
            'The number of refund receipts to skip before starting to return results (default: 0)',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for refund receipts',
          longDesc:
            'Apply filtering to narrow down the list of refund receipts based on specific field values',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to filter on',
                longDesc: 'The refund receipt field to apply the filter criteria to',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'The operator to use for comparing the field value (e.g., =, !=, <, >)',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The value to compare against the specified field',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort criteria for refund receipts',
          longDesc: 'Specify how to sort the returned refund receipts list',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'The field to sort by',
                longDesc: 'The refund receipt field to use for sorting the results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'The sort direction',
                longDesc: 'Whether to sort in ascending or descending order',
              },
            },
          },
        },
      },
    },
    get_sales_receipt: {
      displayName: 'Get Sales Receipt',
      shortDesc: 'Retrieve a specific sales receipt from QuickBooks',
      longDesc: 'Fetch detailed information about a specific sales receipt using its ID',
      options: {
        id: {
          displayName: 'Sales Receipt ID',
          shortDesc: 'The unique identifier of the sales receipt',
          longDesc: 'The QuickBooks sales receipt ID to retrieve detailed information for',
        },
      },
    },
    list_sales_receipts: {
      displayName: 'List Sales Receipts',
      shortDesc: 'Retrieve a list of sales receipts from QuickBooks',
      longDesc:
        'Fetch multiple sales receipts from QuickBooks with optional filtering, sorting, and pagination capabilities',
      options: {
        fetchAll: {
          displayName: 'Fetch All',
          shortDesc: 'Retrieve all sales receipts without pagination',
          longDesc: 'When enabled, fetches all sales receipts ignoring limit and offset parameters',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of sales receipts to retrieve',
          longDesc:
            'The maximum number of sales receipts to return in a single request (default: 50)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of sales receipts to skip',
          longDesc:
            'The number of sales receipts to skip before starting to return results (default: 0)',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for sales receipts',
          longDesc:
            'Apply filtering to narrow down the list of sales receipts based on specific field values',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to filter on',
                longDesc: 'The sales receipt field to apply the filter criteria to',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'The operator to use for comparing the field value (e.g., =, !=, <, >)',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The value to compare against the specified field',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort criteria for sales receipts',
          longDesc: 'Specify how to sort the returned sales receipts list',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'The field to sort by',
                longDesc: 'The sales receipt field to use for sorting the results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'The sort direction',
                longDesc: 'Whether to sort in ascending or descending order',
              },
            },
          },
        },
      },
    },
    create_vendor: {
      displayName: 'Create Vendor',
      shortDesc: 'Create a new vendor in QuickBooks',
      longDesc:
        'Create a new vendor record with contact information, address, and other business details',
      options: {
        display_name: {
          displayName: 'Display Name',
          shortDesc: 'The display name for the vendor',
          longDesc: 'The name that will be displayed for this vendor in QuickBooks',
        },
        phone: {
          displayName: 'Phone Number',
          shortDesc: 'The primary phone number of the vendor',
          longDesc: 'The main contact phone number for the vendor',
        },
        email: {
          displayName: 'Email Address',
          shortDesc: 'The email address of the vendor',
          longDesc: 'The primary email address for contacting the vendor',
        },
        website: {
          displayName: 'Website',
          shortDesc: "The vendor's website URL",
          longDesc: "The web address of the vendor's website",
        },
        address: {
          displayName: 'Address',
          shortDesc: 'The billing address of the vendor',
          longDesc: 'The address where bills should be sent for this vendor',
          type: {
            fields: {
              Line1: {
                displayName: 'Address Line 1',
                shortDesc: 'The first line of the vendor address',
                longDesc: 'The street address or P.O. box number',
              },
              Line2: {
                displayName: 'Address Line 2',
                shortDesc: 'The second line of the vendor address',
                longDesc: 'Additional address information like apartment or suite number',
              },
              City: {
                displayName: 'City',
                shortDesc: 'The city of the vendor address',
                longDesc: 'The city where the vendor is located',
              },
              PostalCode: {
                displayName: 'Postal Code',
                shortDesc: 'The postal code of the vendor address',
                longDesc: 'The ZIP code or postal code for the vendor address',
              },
              CountrySubDivisionCode: {
                displayName: 'State/Province',
                shortDesc: 'The state or province code',
                longDesc: 'The state or province abbreviation (e.g., CA, NY, ON)',
              },
              Country: {
                displayName: 'Country',
                shortDesc: 'The country of the vendor address',
                longDesc: 'The country where the vendor is located',
              },
            },
          },
        },
      },
    },
    get_vendor: {
      displayName: 'Get Vendor',
      shortDesc: 'Retrieve a specific vendor from QuickBooks',
      longDesc: 'Fetch detailed information about a specific vendor using their ID',
      options: {
        id: {
          displayName: 'Vendor ID',
          shortDesc: 'The unique identifier of the vendor',
          longDesc: 'The QuickBooks vendor ID to retrieve detailed information for',
        },
      },
    },
    list_vendors: {
      displayName: 'List Vendors',
      shortDesc: 'Retrieve a list of vendors from QuickBooks',
      longDesc:
        'Fetch multiple vendors from QuickBooks with optional filtering, sorting, and pagination capabilities',
      options: {
        fetchAll: {
          displayName: 'Fetch All',
          shortDesc: 'Retrieve all vendors without pagination',
          longDesc: 'When enabled, fetches all vendors ignoring limit and offset parameters',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of vendors to retrieve',
          longDesc: 'The maximum number of vendors to return in a single request (default: 50)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of vendors to skip',
          longDesc: 'The number of vendors to skip before starting to return results (default: 0)',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria for vendors',
          longDesc:
            'Apply filtering to narrow down the list of vendors based on specific field values',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to filter on',
                longDesc: 'The vendor field to apply the filter criteria to',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'The operator to use for comparing the field value (e.g., =, !=, <, >)',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The value to compare against the specified field',
              },
            },
          },
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort criteria for vendors',
          longDesc: 'Specify how to sort the returned vendors list',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'The field to sort by',
                longDesc: 'The vendor field to use for sorting the results',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'The sort direction',
                longDesc: 'Whether to sort in ascending or descending order',
              },
            },
          },
        },
      },
    },
    update_vendor: {
      displayName: 'Update Vendor',
      shortDesc: 'Update an existing vendor in QuickBooks',
      longDesc:
        'Modify an existing vendor record with updated contact information, address, and other business details',
      options: {
        id: {
          displayName: 'Vendor ID',
          shortDesc: 'The unique identifier of the vendor to update',
          longDesc: 'The QuickBooks vendor ID that you want to update',
        },
        display_name: {
          displayName: 'Display Name',
          shortDesc: 'The display name for the vendor',
          longDesc: 'The name that will be displayed for this vendor in QuickBooks',
        },
        phone: {
          displayName: 'Phone Number',
          shortDesc: 'The primary phone number of the vendor',
          longDesc: 'The main contact phone number for the vendor',
        },
        email: {
          displayName: 'Email Address',
          shortDesc: 'The email address of the vendor',
          longDesc: 'The primary email address for contacting the vendor',
        },
        website: {
          displayName: 'Website',
          shortDesc: "The vendor's website URL",
          longDesc: "The web address of the vendor's website",
        },
        address: {
          displayName: 'Address',
          shortDesc: 'The billing address of the vendor',
          longDesc: 'The address where bills should be sent for this vendor',
          type: {
            fields: {
              Line1: {
                displayName: 'Address Line 1',
                shortDesc: 'The first line of the vendor address',
                longDesc: 'The street address or P.O. box number',
              },
              Line2: {
                displayName: 'Address Line 2',
                shortDesc: 'The second line of the vendor address',
                longDesc: 'Additional address information like apartment or suite number',
              },
              City: {
                displayName: 'City',
                shortDesc: 'The city of the vendor address',
                longDesc: 'The city where the vendor is located',
              },
              PostalCode: {
                displayName: 'Postal Code',
                shortDesc: 'The postal code of the vendor address',
                longDesc: 'The ZIP code or postal code for the vendor address',
              },
              CountrySubDivisionCode: {
                displayName: 'State/Province',
                shortDesc: 'The state or province code',
                longDesc: 'The state or province abbreviation (e.g., CA, NY, ON)',
              },
              Country: {
                displayName: 'Country',
                shortDesc: 'The country of the vendor address',
                longDesc: 'The country where the vendor is located',
              },
            },
          },
        },
      },
    },
  },
  triggers: {
    bill_trigger: {
      displayName: 'Bill Trigger',
      shortDesc: 'Triggers when a bill is created or updated in QuickBooks',
      longDesc:
        'Monitor QuickBooks for new bills or updates to existing bills. This trigger allows you to respond to bill events in real-time.',
      options: {
        action: {
          displayName: 'Trigger Action',
          shortDesc: 'Choose whether to trigger on created or updated bills',
          longDesc:
            'Select "Created" to trigger when new bills are added to QuickBooks, or "Updated" to trigger when existing bills are modified.',
        },
      },
    },
    credit_memo_trigger: {
      displayName: 'Credit Memo Trigger',
      shortDesc: 'Triggers when a credit memo is created or updated in QuickBooks',
      longDesc:
        'Monitor QuickBooks for new credit memos or updates to existing credit memos. This trigger allows you to respond to credit memo events in real-time.',
      options: {
        action: {
          displayName: 'Trigger Action',
          shortDesc: 'Choose whether to trigger on created or updated credit memos',
          longDesc:
            'Select "Created" to trigger when new credit memos are added to QuickBooks, or "Updated" to trigger when existing credit memos are modified.',
        },
      },
    },
    customer_trigger: {
      displayName: 'Customer Trigger',
      shortDesc: 'Triggers when a customer is created or updated in QuickBooks',
      longDesc:
        'Monitor QuickBooks for new customers or updates to existing customers. This trigger allows you to respond to customer events in real-time.',
      options: {
        action: {
          displayName: 'Trigger Action',
          shortDesc: 'Choose whether to trigger on created or updated customers',
          longDesc:
            'Select "Created" to trigger when new customers are added to QuickBooks, or "Updated" to trigger when existing customers are modified.',
        },
      },
    },
    deposit_trigger: {
      displayName: 'Deposit Trigger',
      shortDesc: 'Triggers when a deposit is created or updated in QuickBooks',
      longDesc:
        'Monitor QuickBooks for new deposits or updates to existing deposits. This trigger allows you to respond to deposit events in real-time.',
      options: {
        action: {
          displayName: 'Trigger Action',
          shortDesc: 'Choose whether to trigger on created or updated deposits',
          longDesc:
            'Select "Created" to trigger when new deposits are added to QuickBooks, or "Updated" to trigger when existing deposits are modified.',
        },
      },
    },
    estimate_trigger: {
      displayName: 'Estimate Trigger',
      shortDesc: 'Triggers when an estimate is created or updated in QuickBooks',
      longDesc:
        'Monitor QuickBooks for new estimates or updates to existing estimates. This trigger allows you to respond to estimate events in real-time.',
      options: {
        action: {
          displayName: 'Trigger Action',
          shortDesc: 'Choose whether to trigger on created or updated estimates',
          longDesc:
            'Select "Created" to trigger when new estimates are added to QuickBooks, or "Updated" to trigger when existing estimates are modified.',
        },
      },
    },
    invoice_trigger: {
      displayName: 'Invoice Trigger',
      shortDesc: 'Triggers when an invoice is created or updated in QuickBooks',
      longDesc:
        'Monitor QuickBooks for new invoices or updates to existing invoices. This trigger allows you to respond to invoice events in real-time.',
      options: {
        action: {
          displayName: 'Trigger Action',
          shortDesc: 'Choose whether to trigger on created or updated invoices',
          longDesc:
            'Select "Created" to trigger when new invoices are added to QuickBooks, or "Updated" to trigger when existing invoices are modified.',
        },
      },
    },
    item_trigger: {
      displayName: 'Item Trigger',
      shortDesc: 'Triggers when an item is created or updated in QuickBooks',
      longDesc:
        'Monitor QuickBooks for new items or updates to existing items. This trigger allows you to respond to item events in real-time.',
      options: {
        action: {
          displayName: 'Trigger Action',
          shortDesc: 'Choose whether to trigger on created or updated items',
          longDesc:
            'Select "Created" to trigger when new items are added to QuickBooks, or "Updated" to trigger when existing items are modified.',
        },
      },
    },
    journal_entry_trigger: {
      displayName: 'Journal Entry Trigger',
      shortDesc: 'Triggers when a journal entry is created or updated in QuickBooks',
      longDesc:
        'Monitor QuickBooks for new journal entries or updates to existing journal entries. This trigger allows you to respond to journal entry events in real-time.',
      options: {
        action: {
          displayName: 'Trigger Action',
          shortDesc: 'Choose whether to trigger on created or updated journal entries',
          longDesc:
            'Select "Created" to trigger when new journal entries are added to QuickBooks, or "Updated" to trigger when existing journal entries are modified.',
        },
      },
    },
    payment_trigger: {
      displayName: 'Payment Trigger',
      shortDesc: 'Triggers when a payment is created or updated in QuickBooks',
      longDesc:
        'Monitor QuickBooks for new payments or updates to existing payments. This trigger allows you to respond to payment events in real-time.',
      options: {
        action: {
          displayName: 'Trigger Action',
          shortDesc: 'Choose whether to trigger on created or updated payments',
          longDesc:
            'Select "Created" to trigger when new payments are added to QuickBooks, or "Updated" to trigger when existing payments are modified.',
        },
      },
    },
    purchase_order_trigger: {
      displayName: 'Purchase Order Trigger',
      shortDesc: 'Triggers when a purchase order is created or updated in QuickBooks',
      longDesc:
        'Monitor QuickBooks for new purchase orders or updates to existing purchase orders. This trigger allows you to respond to purchase order events in real-time.',
      options: {
        action: {
          displayName: 'Trigger Action',
          shortDesc: 'Choose whether to trigger on created or updated purchase orders',
          longDesc:
            'Select "Created" to trigger when new purchase orders are added to QuickBooks, or "Updated" to trigger when existing purchase orders are modified.',
        },
      },
    },
    purchase_trigger: {
      displayName: 'Purchase Trigger',
      shortDesc: 'Triggers when a purchase is created or updated in QuickBooks',
      longDesc:
        'Monitor QuickBooks for new purchases or updates to existing purchases. This trigger allows you to respond to purchase events in real-time.',
      options: {
        action: {
          displayName: 'Trigger Action',
          shortDesc: 'Choose whether to trigger on created or updated purchases',
          longDesc:
            'Select "Created" to trigger when new purchases are added to QuickBooks, or "Updated" to trigger when existing purchases are modified.',
        },
      },
    },
    refund_receipt_trigger: {
      displayName: 'Refund Receipt Trigger',
      shortDesc: 'Triggers when a refund receipt is created or updated in QuickBooks',
      longDesc:
        'Monitor QuickBooks for new refund receipts or updates to existing refund receipts. This trigger allows you to respond to refund receipt events in real-time.',
      options: {
        action: {
          displayName: 'Trigger Action',
          shortDesc: 'Choose whether to trigger on created or updated refund receipts',
          longDesc:
            'Select "Created" to trigger when new refund receipts are added to QuickBooks, or "Updated" to trigger when existing refund receipts are modified.',
        },
      },
    },
    sales_receipt_trigger: {
      displayName: 'Sales Receipt Trigger',
      shortDesc: 'Triggers when a sales receipt is created or updated in QuickBooks',
      longDesc:
        'Monitor QuickBooks for new sales receipts or updates to existing sales receipts. This trigger allows you to respond to sales receipt events in real-time.',
      options: {
        action: {
          displayName: 'Trigger Action',
          shortDesc: 'Choose whether to trigger on created or updated sales receipts',
          longDesc:
            'Select "Created" to trigger when new sales receipts are added to QuickBooks, or "Updated" to trigger when existing sales receipts are modified.',
        },
      },
    },
    vendor_trigger: {
      displayName: 'Vendor Trigger',
      shortDesc: 'Triggers when a vendor is created or updated in QuickBooks',
      longDesc:
        'Monitor QuickBooks for new vendors or updates to existing vendors. This trigger allows you to respond to vendor events in real-time.',
      options: {
        action: {
          displayName: 'Trigger Action',
          shortDesc: 'Choose whether to trigger on created or updated vendors',
          longDesc:
            'Select "Created" to trigger when new vendors are added to QuickBooks, or "Updated" to trigger when existing vendors are modified.',
        },
      },
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
      longDesc: 'Combines multiple conditions where at least one must be true (evaluated client-side)',
    },
    '==': {
      displayName: 'Equals',
      shortDesc: 'Field equals value',
      longDesc: 'Matches records where the field equals the specified value',
    },
    '!=': {
      displayName: 'Not Equals',
      shortDesc: 'Field does not equal value',
      longDesc: 'Matches records where the field does not equal the specified value (evaluated client-side)',
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
      longDesc: 'Matches records where the field has a value (is not empty, evaluated client-side)',
    },
    'is-not-set': {
      displayName: 'Is Not Set',
      shortDesc: 'Field has no value',
      longDesc: 'Matches records where the field has no value (is empty, evaluated client-side)',
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
  },
};

export default QuickbooksAppEn;
