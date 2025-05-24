

const XeroAppEn = {
  displayName: 'Xero',
  shortDesc: `Seamlessly interact with Xero's API`,
  longDesc: 'Connect, manage, and automate tasks via the Xero API',
  triggers: {
    new_bank_transaction: {
      displayName: 'New Bank Transaction',
      shortDesc: 'Triggers when a new bank transaction is created in Xero',
      longDesc:
        'This trigger monitors your Xero account for new bank transactions. You can filter by bank account and transaction type (money in or money out).',
      options: {
        'xero-tenant-id': {
          displayName: 'Xero Organization',
          shortDesc: 'The Xero organization to monitor for new bank transactions',
          longDesc:
            'Select which Xero organization (tenant) should be monitored for new bank transactions',
        },
        transactionType: {
          displayName: 'Transaction Type',
          shortDesc: 'Filter transactions by type (money in or money out)',
          longDesc:
            'Optionally filter to only trigger on specific transaction types: "Receive" for money coming into your account, or "Spend" for money going out',
        },
        bankAccountId: {
          displayName: 'Bank Account',
          shortDesc: 'Filter transactions by bank account',
          longDesc:
            'Optionally filter to only trigger on transactions from a specific bank account',
        },
      },
    },
    new_contact: {
      displayName: 'New Contact',
      shortDesc: 'Triggers when a new contact is created in Xero',
      longDesc:
        'This trigger monitors your Xero account for newly created contacts. You can filter to only monitor customers, suppliers, or all contacts.',
      options: {
        'xero-tenant-id': {
          displayName: 'Xero Organization',
          shortDesc: 'The Xero organization to monitor for new contacts',
          longDesc: 'Select which Xero organization (tenant) should be monitored for new contacts',
        },
        contactType: {
          displayName: 'Contact Type',
          shortDesc: 'Filter by customer or supplier type',
          longDesc: 'Choose whether to monitor all contacts, only customers, or only suppliers',
        },
      },
    },
    new_credit_note: {
      displayName: 'New Credit Note',
      shortDesc: 'Triggers when a new credit note is created in Xero',
      longDesc:
        'This trigger monitors your Xero account for newly created credit notes. You can filter by customer and status.',
      options: {
        'xero-tenant-id': {
          displayName: 'Xero Organization',
          shortDesc: 'The Xero organization to monitor for new credit notes',
          longDesc:
            'Select which Xero organization (tenant) should be monitored for new credit notes',
        },
        contactId: {
          displayName: 'Customer',
          shortDesc: 'Filter credit notes by a specific customer',
          longDesc:
            'Optionally filter to only trigger on credit notes for a specific customer (contact)',
        },
        status: {
          displayName: 'Credit Note Status',
          shortDesc: 'Filter credit notes by their status',
          longDesc:
            'Optionally filter to only trigger on credit notes with a specific status (Draft, Submitted, Authorised, etc.)',
        },
      },
    },
    new_employee: {
      displayName: 'New Employee',
      shortDesc: 'Triggers when a new employee is created in Xero',
      longDesc:
        'This trigger monitors your Xero account for newly created employees. You can filter by employee status (active or terminated).',
      options: {
        'xero-tenant-id': {
          displayName: 'Xero Organization',
          shortDesc: 'The Xero organization to monitor for new employees',
          longDesc: 'Select which Xero organization (tenant) should be monitored for new employees',
        },
        status: {
          displayName: 'Employee Status',
          shortDesc: 'Filter employees by active or terminated status',
          longDesc:
            'Choose whether to monitor all employees, only active employees, or only terminated employees',
        },
      },
    },
    new_payment: {
      displayName: 'New Payment',
      shortDesc: 'Triggers when a new payment is created in Xero',
      longDesc:
        'This trigger monitors your Xero account for new payments. You can filter by customer, payment status, and bank account.',
      options: {
        'xero-tenant-id': {
          displayName: 'Xero Organization',
          shortDesc: 'The Xero organization to monitor for new payments',
          longDesc: 'Select which Xero organization (tenant) should be monitored for new payments',
        },
        contactId: {
          displayName: 'Customer',
          shortDesc: 'Filter payments by a specific customer',
          longDesc:
            'Optionally filter to only trigger on payments from a specific customer (contact)',
        },
        status: {
          displayName: 'Payment Status',
          shortDesc: 'Filter payments by their status',
          longDesc:
            'Optionally filter to only trigger on payments with a specific status (Authorised or Deleted)',
        },
        bankAccountId: {
          displayName: 'Bank Account',
          shortDesc: 'Filter payments by bank account',
          longDesc:
            'Optionally filter to only trigger on payments to or from a specific bank account',
        },
      },
    },
    new_purchase_order: {
      displayName: 'New Purchase Order',
      shortDesc: 'Triggers when a new purchase order is created in Xero',
      longDesc:
        'This trigger monitors your Xero account for newly created purchase orders. You can filter by supplier and purchase order status.',
      options: {
        'xero-tenant-id': {
          displayName: 'Xero Organization',
          shortDesc: 'The Xero organization to monitor for new purchase orders',
          longDesc:
            'Select which Xero organization (tenant) should be monitored for new purchase orders',
        },
        contactId: {
          displayName: 'Supplier',
          shortDesc: 'Filter purchase orders by a specific supplier',
          longDesc:
            'Optionally filter to only trigger on purchase orders from a specific supplier (contact)',
        },
        status: {
          displayName: 'Purchase Order Status',
          shortDesc: 'Filter purchase orders by their status',
          longDesc:
            'Optionally filter to only trigger on purchase orders with a specific status (Draft, Submitted, Authorised, etc.)',
        },
      },
    },
    new_bill: {
      displayName: 'New Bill',
      shortDesc: 'Triggers when a new bill is created in Xero',
      longDesc:
        'This trigger monitors your Xero account for newly created bills (Accounts Payable invoices). You can filter by supplier (contact), status, or monitor all new bills.',
      options: {
        'xero-tenant-id': {
          displayName: 'Xero Organization',
          shortDesc: 'The Xero organization to monitor for new bills',
          longDesc: 'Select which Xero organization (tenant) should be monitored for new bills',
        },
        contactId: {
          displayName: 'Supplier',
          shortDesc: 'Filter bills by a specific supplier',
          longDesc: 'Optionally filter to only trigger on bills from a specific supplier (contact)',
        },
        status: {
          displayName: 'Bill Status',
          shortDesc: 'Filter bills by their status',
          longDesc:
            'Optionally filter to only trigger on bills with a specific status (Draft, Submitted, Authorised, etc.)',
        },
      },
    },
  },
  actions: {
    getProjects: {
      displayName: 'Find Projects',
    },
    createProject: {
      displayName: 'Create Project',
    },
    getTasks: {
      displayName: 'Find Tasks',
    },
    createTask: {
      displayName: 'Create Task',
    },
    getProjectUsers: {
      displayName: 'Find Project Users',
    },
    uploadFile: {
      displayName: 'Upload Attachment',
      options: {
        body: {
          displayName: 'File',
          shortDesc: 'File to upload',
          longDesc: 'File to upload',
        },
      },
    },
    updateOrCreateBankTransactions: {
      displayName: 'Create Bank Transaction',
    },
    getContacts: {
      displayName: 'Find Contacts',
    },
    updateOrCreateContacts: {
      displayName: 'Create or Update Contacts',
    },
    updateOrCreateCreditNotes: {
      displayName: 'Create Credit Note',
    },
    createCreditNoteAllocation: {
      displayName: 'Allocate Credit Note to Invoice',
      options: {
        InvoiceID: {
          displayName: 'Invoice ID',
          shortDesc: 'ID of the invoice to allocate the credit note to',
          longDesc: 'ID of the invoice to allocate the credit note to',
        },
        Amount: {
          displayName: 'Amount',
          shortDesc: 'Amount to allocate from the credit note',
          longDesc: 'Amount to allocate from the credit note',
        },
      },
    },
    getEmployees: {
      displayName: 'Find Employees',
    },
    updateOrCreateEmployees: {
      displayName: 'Create/Update Employee',
    },
    getInvoices: {
      displayName: 'Find Invoices',
    },
    updateOrCreateInvoices: {
      displayName: 'Create Sales Invoice',
    },
    updateInvoice: {
      displayName: 'Update Sales Invoice',
    },
    emailInvoice: {
      displayName: 'Send Sales Invoice by Email',
    },
    getInvoiceHistory: {
      displayName: 'Get Invoice History',
    },
    createInvoiceHistory: {
      displayName: 'Add Note to Invoice',
      options: {
        note: {
          displayName: 'Note',
          shortDesc: 'Note to add to the invoice history',
          longDesc: 'Note to add to the invoice history',
        },
      },
    },
    getItems: {
      displayName: 'Find Items',
    },
    updateOrCreateItems: {
      displayName: 'Add or Update Stock Items',
    },
    createPayment: {
      displayName: 'Create Payment',
    },
    getPurchaseOrders: {
      displayName: 'Find Purchase Orders',
    },
    updateOrCreatePurchaseOrders: {
      displayName: 'Create Purchase Order',
    },
    updatePurchaseOrder: {
      displayName: 'Update Purchase Order',
    },
    updateOrCreateQuotes: {
      displayName: 'Create New Quote Draft',
    },
    updateOrCreateRepeatingInvoices: {
      displayName: 'Create Repeating Sales Invoice',
    },
  },
};

export default XeroAppEn;
