import { configDotenv } from 'dotenv';
import {
  CreateQuickbooksBill,
  CreateQuickbooksCustomer,
  CreateQuickbooksInvoice,
  DeleteQuickbooksBill,
  DeleteQuickbooksInvoice,
  GetQuickbooksAccount,
  GetQuickbooksBill,
  GetQuickbooksCompanyInfo,
  GetQuickbooksCustomer,
  ListQuickbooksAccounts,
  ListQuickbooksBills,
  ListQuickbooksCreditMemos,
  ListQuickbooksCustomers,
  ListQuickbooksDeposits,
  ListQuickbooksEstimates,
  ListQuickbooksInvoices,
  ListQuickbooksItems,
  ListQuickbooksJournalEntries,
  ListQuickbooksPayments,
  ListQuickbooksPurchaseOrders,
  ListQuickbooksPurchases,
  ListQuickbooksRefundReceipts,
  ListQuickbooksSalesReceipts,
  ListQuickbooksVendors,
  UpdateQuickbooksCustomer,
} from '../apps/quickbooks/actions';
import { getQuickbooksAccountIdAllowedValues } from '../apps/quickbooks/helpers/get-account-id-allowed-values';
import { getQuickbooksBillIdAllowedValues } from '../apps/quickbooks/helpers/get-bill-id-allowed-values';
import { getQuickbooksClassIdAllowedValues } from '../apps/quickbooks/helpers/get-class-id-allowed-values';
import { getQuickbooksCreditMemoIdAllowedValues } from '../apps/quickbooks/helpers/get-credit-memo-id-allowed-values';
import { getQuickbooksCustomerIdAllowedValues } from '../apps/quickbooks/helpers/get-customer-id-allowed-values';
import { getQuickbooksDepositIdAllowedValues } from '../apps/quickbooks/helpers/get-deposit-id-allowed-values';
import { getQuickbooksEstimateIdAllowedValues } from '../apps/quickbooks/helpers/get-estimate-id-allowed-values';
import { getQuickbooksInvoiceIdAllowedValues } from '../apps/quickbooks/helpers/get-invoice-id-allowed-values';
import { getQuickbooksItemIdAllowedValues } from '../apps/quickbooks/helpers/get-item-id-allowed-values';
import { getQuickbooksJournalEntryIdAllowedValues } from '../apps/quickbooks/helpers/get-journal-entry-id-allowed-values';
import { getQuickbooksPaymentIdAllowedValues } from '../apps/quickbooks/helpers/get-payment-id-allowed-values';
import { getQuickbooksPurchaseIdAllowedValues } from '../apps/quickbooks/helpers/get-purchase-id-allowed-values';
import { getQuickbooksPurchaseOrderIdAllowedValues } from '../apps/quickbooks/helpers/get-purchase-order-id-allowed-values';
import { getQuickbooksRefundReceiptIdAllowedValues } from '../apps/quickbooks/helpers/get-refund-receipt-id-allowed-values';
import { getQuickbooksSalesReceiptIdAllowedValues } from '../apps/quickbooks/helpers/get-sales-receipt-id-allowed-values';
import { getQuickbooksTaxCodeIdAllowedValues } from '../apps/quickbooks/helpers/get-tax-code-id-allowed-values';
import { getQuickbooksVendorIdAllowedValues } from '../apps/quickbooks/helpers/get-vendor-id-allowed-values';

configDotenv({ path: '.env' });

describe('Test Quickbooks Actions', () => {
  const base_context = {
    conn_opts: {
      token: '',
      instance_type: 'sandbox',
      realm_id: '',
    } as any,
  };

  beforeAll(async () => {
    const token = process.env.QUICKBOOKS_REFRESH_TOKEN;
    const realm_id = process.env.QUICKBOOKS_REALM_ID;
    const clientId = process.env.QUICKBOOKS_CLIENT_ID;
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;

    if (!token || !realm_id || !clientId || !clientSecret) {
      throw new Error(
        `Please set the` +
          `QUICKBOOKS_REFRESH_TOKEN, QUICKBOOKS_REALM_ID, QUICKBOOKS_CLIENT_ID, ` +
          `and QUICKBOOKS_CLIENT_SECRET environment variables.`
      );
    }

    const data = {
      refresh_token: token,
      grant_type: 'refresh_token',
    };

    const basicToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const formBody = Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`
      )
      .join('&');

    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicToken}`,
      },
      body: formBody,
    });

    const responseData = await response.json();

    if (!responseData?.access_token) {
      console.error('Failed to get access token:', responseData);
      throw new Error('Failed to get access token from Quickbooks API');
    }

    base_context.conn_opts.token = responseData.access_token;
    base_context.conn_opts.realm_id = realm_id;
  });

  let vendor_id: string | undefined;
  let customer_id: string | undefined;
  let account_id: string | undefined;
  let item_id: string | undefined;

  describe('Should test Quickbooks allowed values', () => {
    const testCases = [
      {
        name: 'account id',
        fn: getQuickbooksAccountIdAllowedValues,
        assignTo: 'account_id',
        expectMinItems: 1,
      },
      {
        name: 'class id',
        fn: getQuickbooksClassIdAllowedValues,
        assignTo: null,
        expectMinItems: 0,
      },
      {
        name: 'tax code id',
        fn: getQuickbooksTaxCodeIdAllowedValues,
        assignTo: null,
        expectMinItems: 1,
      },
      {
        name: 'bill id',
        fn: getQuickbooksBillIdAllowedValues,
        assignTo: null,
        expectMinItems: 1,
      },
      {
        name: 'credit memo id',
        fn: getQuickbooksCreditMemoIdAllowedValues,
        assignTo: null,
        expectMinItems: 1,
      },
      {
        name: 'customer id',
        fn: getQuickbooksCustomerIdAllowedValues,
        assignTo: 'customer_id',
        expectMinItems: 1,
      },
      {
        name: 'deposit id',
        fn: getQuickbooksDepositIdAllowedValues,
        assignTo: null,
        expectMinItems: 1,
      },
      {
        name: 'estimate id',
        fn: getQuickbooksEstimateIdAllowedValues,
        assignTo: null,
        expectMinItems: 1,
      },
      {
        name: 'invoice id',
        fn: getQuickbooksInvoiceIdAllowedValues,
        assignTo: null,
        expectMinItems: 1,
      },
      {
        name: 'item id',
        fn: getQuickbooksItemIdAllowedValues,
        assignTo: 'item_id',
        expectMinItems: 1,
      },
      {
        name: 'journal entry id',
        fn: getQuickbooksJournalEntryIdAllowedValues,
        assignTo: null,
        expectMinItems: 1,
      },
      {
        name: 'payment id',
        fn: getQuickbooksPaymentIdAllowedValues,
        assignTo: null,
        expectMinItems: 1,
      },
      {
        name: 'purchase order id',
        fn: getQuickbooksPurchaseOrderIdAllowedValues,
        assignTo: null,
        expectMinItems: 1,
      },
      {
        name: 'purchase id',
        fn: getQuickbooksPurchaseIdAllowedValues,
        assignTo: null,
        expectMinItems: 1,
      },
      {
        name: 'refund receipt id',
        fn: getQuickbooksRefundReceiptIdAllowedValues,
        assignTo: null,
        expectMinItems: 1,
      },
      {
        name: 'sales receipt id',
        fn: getQuickbooksSalesReceiptIdAllowedValues,
        assignTo: null,
        expectMinItems: 1,
      },
      {
        name: 'vendor id',
        fn: getQuickbooksVendorIdAllowedValues,
        assignTo: 'vendor_id',
        expectMinItems: 1,
      },
    ];

    test.each(testCases)(
      'Should get $name allowed values',
      async ({ expectMinItems, fn, assignTo }) => {
        const allowed_values = await fn(base_context);

        expect(allowed_values).toBeDefined();
        expect(Array.isArray(allowed_values)).toBe(true);
        expect(allowed_values.length).toBeGreaterThanOrEqual(expectMinItems);

        if (!(assignTo && allowed_values.length > 0)) return;

        if (assignTo === 'account_id') account_id = allowed_values[0].value;
        if (assignTo === 'customer_id') customer_id = allowed_values[0].value;
        if (assignTo === 'item_id') item_id = allowed_values[0].value;
        if (assignTo === 'vendor_id') vendor_id = allowed_values[0].value;
      }
    );
  });

  describe('Should test Quickbooks actions', () => {
    let created_bill_id: string | undefined;
    let created_customer_id: string | undefined;
    let created_invoice_id: string | undefined;

    it('Should list accounts', async () => {
      const action = ListQuickbooksAccounts;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.accounts).toBeDefined();
      expect(result.accounts.length).toBe(1);
    });

    it('Should get an account', async () => {
      const action = GetQuickbooksAccount;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!account_id) {
        throw new Error('account_id must be defined');
      }

      const result = await action.api_function(
        {
          id: account_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.Id).toBeDefined();
      expect(result.Id).toBe(account_id);
    });

    it('Should create a bill', async () => {
      const action = CreateQuickbooksBill;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!vendor_id || !account_id || !customer_id) {
        throw new Error('vendor_id, account_id, and customer_id must be defined');
      }

      const result = await action.api_function(
        {
          vendor_id,
          line_item_type: 'AccountBasedExpenseLineDetail',
          line_items: [
            {
              // @ts-expect-error two different types of line items are supported
              account_id,
              customer_id,
              amount: 100,
            },
          ],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.Id).toBeDefined();

      created_bill_id = result.Id;
    });

    it('Should get the bill', async () => {
      const action = GetQuickbooksBill;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!created_bill_id) {
        throw new Error('created_bill_id must be defined');
      }

      const result = await action.api_function(
        {
          id: created_bill_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.Id).toBeDefined();
      expect(result.Id).toBe(created_bill_id);
    });

    it('Should delete the bill', async () => {
      const action = DeleteQuickbooksBill;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!created_bill_id) {
        throw new Error('created_bill_id must be defined');
      }

      const result = await action.api_function(
        {
          id: created_bill_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.Id).toBeDefined();
    });

    it('Should list bills', async () => {
      const action = ListQuickbooksBills;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.bills).toBeDefined();
      expect(result.bills.length).toBe(1);
    });

    it('Should list credit memos', async () => {
      const action = ListQuickbooksCreditMemos;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.credit_memos).toBeDefined();
      expect(result.credit_memos.length).toBe(1);
    });

    it('Should create a customer', async () => {
      const action = CreateQuickbooksCustomer;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          display_name: `Test Customer ${Date.now()}`,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.Id).toBeDefined();

      created_customer_id = result.Id;
    });

    it('Should update a customer', async () => {
      const action = UpdateQuickbooksCustomer;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!created_customer_id) {
        throw new Error('created_customer_id must be defined');
      }

      const result = await action.api_function(
        {
          customer_id: created_customer_id,
          middle_name: `Updated ${Date.now()}`,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.Id).toBeDefined();
      expect(result.Id).toBe(created_customer_id);
    });

    it('Should get the customer', async () => {
      const action = GetQuickbooksCustomer;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!created_customer_id) {
        throw new Error('created_customer_id must be defined');
      }

      const result = await action.api_function(
        {
          id: created_customer_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.Id).toBeDefined();
      expect(result.Id).toBe(created_customer_id);
    });

    it('Should list customers', async () => {
      const action = ListQuickbooksCustomers;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.customers).toBeDefined();
      expect(result.customers.length).toBe(1);
    });

    it('Should list deposits', async () => {
      const action = ListQuickbooksDeposits;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.deposits).toBeDefined();
      expect(result.deposits.length).toBe(1);
    });

    it('Should list estimates', async () => {
      const action = ListQuickbooksEstimates;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.estimates).toBeDefined();
      expect(result.estimates.length).toBe(1);
    });

    it('Should get company info', async () => {
      const action = GetQuickbooksCompanyInfo;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.Id).toBeDefined();
    });

    it('Should list invoices', async () => {
      const action = ListQuickbooksInvoices;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.invoices).toBeDefined();
      expect(result.invoices.length).toBe(1);
    });

    it('Should create an invoice', async () => {
      const action = CreateQuickbooksInvoice;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!customer_id || !item_id) {
        throw new Error('customer_id and item_id must be defined');
      }

      const result = await action.api_function(
        {
          customer: customer_id,
          lines: [
            {
              amount: 100,
              item_id,
            } as any,
          ],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.Id).toBeDefined();

      created_invoice_id = result.Id;
    });

    it('Should delete an invoice', async () => {
      const action = DeleteQuickbooksInvoice;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!created_invoice_id) {
        throw new Error('created_invoice_id must be defined');
      }

      const result = await action.api_function(
        {
          id: created_invoice_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.Id).toBeDefined();
    });

    it('Should list items', async () => {
      const action = ListQuickbooksItems;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.items.length).toBe(1);
    });

    it('Should list journal entries', async () => {
      const action = ListQuickbooksJournalEntries;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.journal_entries).toBeDefined();
      expect(result.journal_entries.length).toBe(1);
    });

    it('Should list payments', async () => {
      const action = ListQuickbooksPayments;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.payments).toBeDefined();
      expect(result.payments.length).toBe(1);
    });

    it('Should list purchase orders', async () => {
      const action = ListQuickbooksPurchaseOrders;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.purchase_orders).toBeDefined();
      expect(result.purchase_orders.length).toBe(1);
    });

    it('Should list purchases', async () => {
      const action = ListQuickbooksPurchases;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.purchases).toBeDefined();
      expect(result.purchases.length).toBe(1);
    });

    it('Should list refund receipts', async () => {
      const action = ListQuickbooksRefundReceipts;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.refund_receipts).toBeDefined();
      expect(result.refund_receipts.length).toBe(1);
    });

    it('Should list sales receipts', async () => {
      const action = ListQuickbooksSalesReceipts;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.sales_receipts).toBeDefined();
      expect(result.sales_receipts.length).toBe(1);
    });

    it('Should list vendors', async () => {
      const action = ListQuickbooksVendors;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          limit: 1,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.vendors).toBeDefined();
      expect(result.vendors.length).toBe(1);
    });
  });
});
