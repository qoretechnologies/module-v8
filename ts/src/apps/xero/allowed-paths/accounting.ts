import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import xeroAccounting from '../../../schemas/xero/accounting.swagger.json';
import { XERO_APP_NAME } from '../constants';
import { getXeroTenantIdAllowedValues } from '../helpers/get-tenant-id-allowed-values';
import { getXeroInvoiceIdAllowedValues } from '../helpers/get-invoice-id-allowed-values';
import { getXeroBankAccountIdAllowedValues } from '../helpers/get-bank-account-id-allowed-values';
import { getXeroContactIdAllowedValues } from '../helpers/get-contact-id-allowed-values';
import { getXeroAccountIdAllowedValues } from '../helpers/get-account-id-allowed-values';
import { getXeroItemCodeAllowedValues } from '../helpers/get-item-code-allowed-values';
import { getXeroItemIdAllowedValues } from '../helpers/get-item-id-allowed-values';
import { getXeroAccountCodeAllowedValues } from '../helpers/get-account-code-allowed-values';
import { getXeroCreditNoteIdAllowedValues } from '../helpers/get-credit-note-id-allowed-values';
import { getXeroEmployeeIdAllowedValues } from '../helpers/get-employee.id-allowed-values';

export const XERO_ACCOUNTING_ALLOWED_PATHS = {
  '/Contacts': {
    POST: {
      override_options: {
        Contacts: {
          required: true,
        },
        'Contacts.ContactID': {
          get_allowed_values: getXeroContactIdAllowedValues,
        },
      },
    },
    GET: {
      override_options: {
        IDs: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          get_element_allowed_values: getXeroContactIdAllowedValues,
        },
      },
      request_data_converter: (req) => {
        const { query, ...rest } = req;
        const { IDs, ...restQuery } = query;

        return {
          ...rest,
          query: {
            ...restQuery,
            ...(IDs?.length && {
              IDs: IDs.join(','),
            }),
          },
        };
      },
    },
  },
  '/Employees': {
    POST: {
      override_options: {
        Employees: {
          required: true,
        },
        'Employees.EmployeeID': {
          get_allowed_values: getXeroEmployeeIdAllowedValues,
        },
        'Employees.FirstName': {
          preselected: true,
        },
        'Employees.LastName': {
          preselected: true,
        },
      },
    },
    GET: {},
  },
  '/Invoices': {
    POST: {
      override_options: {
        Invoices: {
          required: true,
        },
        'Invoices.Type': {
          required: true,
        },
        'Invoices.InvoiceID': {
          get_allowed_values: getXeroInvoiceIdAllowedValues,
        },
        'Invoices.Contact': {
          required: true,
        },
        'Invoices.Contact.ContactID': {
          preselected: true,
          get_allowed_values: getXeroContactIdAllowedValues,
        },
        'Invoices.LineItems': {
          preselected: true,
        },
        'Invoices.LineItems.AccountID': {
          get_allowed_values: getXeroAccountIdAllowedValues,
        },
        'Invoices.LineItems.Item.ItemID': {
          get_allowed_values: getXeroItemIdAllowedValues,
        },
        'Invoices.LineItems.ItemCode': {
          preselected: true,
          get_allowed_values: getXeroItemCodeAllowedValues,
        },
        'Invoices.LineItems.UnitAmount': {
          preselected: true,
          default_value: 1,
        },
        'Invoices.LineItems.Quantity': {
          preselected: true,
          default_value: 1,
        },
      },
    },
    GET: {
      override_options: {
        IDs: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          get_element_allowed_values: getXeroInvoiceIdAllowedValues,
        },
        ContactIDs: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          get_element_allowed_values: getXeroContactIdAllowedValues,
        },
      },
      request_data_converter: (req) => {
        const { query, ...rest } = req;
        const { IDs, ContactIDs, ...restQuery } = query;

        return {
          ...rest,
          query: {
            ...restQuery,
            ...(IDs?.length && {
              InvoiceIDs: IDs.join(','),
            }),
            ...(ContactIDs?.length && {
              ContactIDs: ContactIDs.join(','),
            }),
          },
        };
      },
      response_data_converter: (res) => {
        const body = res.body;

        if (!body?.Invoices) {
          return body;
        }

        return body.Invoices;
      },
    },
  },
  '/Items': {
    POST: {
      override_options: {
        Items: {
          required: true,
        },
        'Items.Code': {
          allowed_values_creatable: true,
          get_allowed_values: getXeroItemCodeAllowedValues,
        },
        'Items.ItemID': {
          get_allowed_values: getXeroItemIdAllowedValues,
        },
      },
    },
    GET: {},
  },
  '/PurchaseOrders': {
    GET: {},
  },
  '/Invoices/{InvoiceID}/History': {
    GET: {
      override_options: {
        InvoiceID: {
          get_allowed_values: getXeroInvoiceIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        InvoiceID: {
          get_allowed_values: getXeroInvoiceIdAllowedValues,
        },
        note: {
          type: 'string',
          required: true,
        },
      },
      request_data_converter: (req) => {
        const { body, ...rest } = req;
        const { note, ...restBody } = body;

        return {
          ...rest,
          body: {
            ...restBody,
            HistoryRecords: [
              {
                Details: note,
              },
            ],
          },
        };
      },
    },
  },
  '/CreditNotes/{CreditNoteID}/Allocations': {
    PUT: {
      override_options: {
        CreditNoteID: {
          get_allowed_values: getXeroCreditNoteIdAllowedValues,
        },
        InvoiceID: {
          type: 'string',
          required: true,
          get_allowed_values: getXeroInvoiceIdAllowedValues,
        },
        Amount: {
          type: 'number',
          required: true,
        },
        'Allocations.Invoice.InvoiceID': {
          get_allowed_values: getXeroInvoiceIdAllowedValues,
        },
      },
      request_data_converter: (req) => {
        const { body, ...rest } = req;
        const { InvoiceID, Amount, ...restBody } = body;

        return {
          ...rest,
          body: {
            ...restBody,
            Allocations: [
              {
                Amount,
                Invoice: {
                  InvoiceID,
                },
              },
            ],
          },
        };
      },
    },
  },
  '/BankTransactions': {
    POST: {
      override_options: {
        BankTransactions: {
          required: true,
        },
        'BankTransactions.BankAccount': {
          type: 'string',
          preselected: true,
          get_allowed_values: getXeroBankAccountIdAllowedValues,
        },
        'BankTransactions.Contact': {
          type: 'string',
          required: true,
          get_allowed_values: getXeroContactIdAllowedValues,
        },
        'BankTransactions.LineItems.AccountID': {
          type: 'string',
          required_groups: ['bank_transaction_item_account'],
          get_allowed_values: getXeroAccountIdAllowedValues,
        },
        'BankTransactions.LineItems.AccountCode': {
          type: 'string',
          required_groups: ['bank_transaction_item_account'],
          get_allowed_values: getXeroAccountCodeAllowedValues,
        },
        'BankTransactions.LineItems.Item.ItemID': {
          type: 'string',
          get_allowed_values: getXeroItemIdAllowedValues,
        },
        'BankTransactions.LineItems.Item.Code': {
          type: 'string',
          preselected: true,
          allowed_values_creatable: true,
          get_allowed_values: getXeroItemCodeAllowedValues,
        },
        'BankTransactions.LineItems.ItemCode': {
          type: 'string',
          preselected: true,
          get_allowed_values: getXeroItemCodeAllowedValues,
        },
        'BankTransactions.LineItems.Quantity': {
          preselected: true,
          default_value: 1,
        },
        'BankTransactions.LineItems.UnitAmount': {
          preselected: true,
          default_value: 1,
        },
      },
      request_data_converter: (req) => {
        const { body, ...rest } = req;
        const { BankTransactions, ...restBody } = body;

        return {
          ...rest,
          body: {
            ...restBody,
            BankTransactions: BankTransactions.map(
              (transaction: { BankAccount?: string; Contact?: string }) => ({
                ...transaction,
                ...(transaction.BankAccount && {
                  BankAccount: { AccountID: transaction.BankAccount },
                }),
                ...(transaction.Contact && { Contact: { ContactID: transaction.Contact } }),
              })
            ),
          },
        };
      },
    },
  },
  '/Quotes': {
    POST: {
      override_options: {
        Quotes: {
          required: true,
        },
        'Quotes.Contact': {
          required: true,
        },
        'Quotes.Contact.ContactID': {
          preselected: true,
          get_allowed_values: getXeroContactIdAllowedValues,
        },
        'Quotes.LineItems': {
          required: true,
        },
        'Quotes.LineItems.AccountID': {
          get_allowed_values: getXeroAccountIdAllowedValues,
        },
        'Quotes.LineItems.ItemCode': {
          preselected: true,
          get_allowed_values: getXeroItemCodeAllowedValues,
        },
        'Quotes.LineItems.Description': {
          required: true,
          get_allowed_values: getXeroItemCodeAllowedValues,
        },
        'Quotes.Date': {
          type: 'date',
          required: true,
        },
      },
    },
  },
  '/Payments': {
    POST: {
      override_options: {
        Account: {
          type: 'string',
          required: true,
          get_allowed_values: getXeroAccountIdAllowedValues,
        },
        Amount: {
          required: true,
        },
        Date: {
          type: 'date',
          required: true,
        },
        Invoice: {
          type: 'string',
          required: true,
          get_allowed_values: getXeroInvoiceIdAllowedValues,
        },
      },
      request_data_converter: (req) => {
        const { body, ...rest } = req;
        const { Account, Invoice, ...restBody } = body;

        return {
          ...rest,
          body: {
            ...restBody,
            Account: {
              AccountID: Account,
            },
            Invoice: {
              InvoiceID: Invoice,
            },
          },
        };
      },
    },
  },
  '/RepeatingInvoices': {
    POST: {
      override_options: {
        RepeatingInvoices: {
          required: true,
        },
        'RepeatingInvoices.Contact': {
          required: true,
        },
        'RepeatingInvoices.Type': {
          required: true,
        },
        'RepeatingInvoices.Contact.ContactID': {
          preselected: true,
          get_allowed_values: getXeroContactIdAllowedValues,
        },
        'RepeatingInvoices.LineItems': {
          required: true,
        },
        'RepeatingInvoices.LineItems.AccountID': {
          preselected: true,
          required_groups: ['repeating_invoice_item_account'],
          get_allowed_values: getXeroAccountIdAllowedValues,
        },
        'RepeatingInvoices.LineItems.AccountCode': {
          preselected: true,
          required_groups: ['repeating_invoice_item_account'],
          get_allowed_values: getXeroAccountCodeAllowedValues,
        },
        'RepeatingInvoices.LineItems.ItemCode': {
          preselected: true,
          required_groups: ['repeating_invoice_item_code'],
          get_allowed_values: getXeroItemCodeAllowedValues,
        },
        'RepeatingInvoices.LineItems.UnitAmount': {
          preselected: true,
          default_value: 1,
        },
        'RepeatingInvoices.LineItems.Quantity': {
          preselected: true,
          default_value: 1,
        },
        'RepeatingInvoices.LineItems.TaxType': {
          preselected: true,
        },
        'RepeatingInvoices.LineItems.Description': {
          required_groups: ['repeating_invoice_item_code'],
        },
        'RepeatingInvoices.Status': {
          required: true,
        },
        'RepeatingInvoices.Schedule': {
          required: true,
        },
      },
    },
  },
  '/Invoices/{InvoiceID}/Email': {
    POST: {
      override_options: {
        InvoiceID: {
          get_allowed_values: getXeroInvoiceIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const XERO_ACCOUNTING_ACTIONS = buildActionsFromSwaggerSchema({
  schema: xeroAccounting as unknown as OpenAPIV2.Document,
  schemaPath: 'accounting',
  allowedPaths: XERO_ACCOUNTING_ALLOWED_PATHS,
  app: XERO_APP_NAME,
  globalOptionsOverride: {
    'xero-tenant-id': {
      type: 'string',
      get_allowed_values: getXeroTenantIdAllowedValues,
    },
  },
});
