import { configDotenv } from 'dotenv';
import fs from 'fs';
import {
  CreateQuickbooksBill,
  DeleteQuickbooksBill,
  GetQuickbooksCompanyInfo,
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
} from '../apps/quickbooks/actions';
import { createQuickbooksClient } from '../apps/quickbooks/helpers/constants';
import { getQuickbooksAccountIdAllowedValues } from '../apps/quickbooks/helpers/get-account-id-allowed-values';
import { getQuickbooksBillIdAllowedValues } from '../apps/quickbooks/helpers/get-bill-id-allowed-values';
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
import { getQuickbooksVendorIdAllowedValues } from '../apps/quickbooks/helpers/get-vendor-id-allowed-values';
import { getQuickbooksTaxCodeIdAllowedValues } from '../apps/quickbooks/helpers/get-tax-code-id-allowed-values';
import { getQuickbooksClassIdAllowedValues } from '../apps/quickbooks/helpers/get-class-id-allowed-values';

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
          `QUICKBOOKS_ACCESS_TOKEN, QUICKBOOKS_REALM_ID, QUICKBOOKS_CLIENT_ID, ` +
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

    console.log('Refresh token response:', responseData.refresh_token);

    const envFilePath = '.env';
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    const newEnvContent = envContent.replace(
      /QUICKBOOKS_REFRESH_TOKEN=.*/,
      `QUICKBOOKS_REFRESH_TOKEN=${responseData.refresh_token}`
    );
    fs.writeFileSync(envFilePath, newEnvContent);

    base_context.conn_opts.token = responseData.access_token;
    base_context.conn_opts.realm_id = realm_id;
  });

  let vendor_id: string | undefined;
  let customer_id: string | undefined;
  let account_id: string | undefined;

  describe('Should test Quickbooks allowed values', () => {
    it('Should get company id allowed values', async () => {
      const client = createQuickbooksClient(base_context.conn_opts);

      const companyInfos = await client.findClasses({
        desc: 'MetaData.CreateTime',
        limit: 1,
      });

      console.dir(companyInfos, { depth: null });
    });

    it('Should get account id allowed values', async () => {
      const allowed_values = await getQuickbooksAccountIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      account_id = allowed_values[0].value;
    });

    it('Should get class id allowed values', async () => {
      const allowed_values = await getQuickbooksClassIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get tax code id allowed values', async () => {
      const allowed_values = await getQuickbooksTaxCodeIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get bill id allowed values', async () => {
      const allowed_values = await getQuickbooksBillIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get credit memo id allowed values', async () => {
      const allowed_values = await getQuickbooksCreditMemoIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get customer id allowed values', async () => {
      const allowed_values = await getQuickbooksCustomerIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      customer_id = allowed_values[0].value;
    });

    it('Should get deposit id allowed values', async () => {
      const allowed_values = await getQuickbooksDepositIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get estimate id allowed values', async () => {
      const allowed_values = await getQuickbooksEstimateIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get invoice id allowed values', async () => {
      const allowed_values = await getQuickbooksInvoiceIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get item id allowed values', async () => {
      const allowed_values = await getQuickbooksItemIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      console.dir(allowed_values, { depth: null });
    });

    it('Should get journal entry id allowed values', async () => {
      const allowed_values = await getQuickbooksJournalEntryIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get payment id allowed values', async () => {
      const allowed_values = await getQuickbooksPaymentIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get purchase order id allowed values', async () => {
      const allowed_values = await getQuickbooksPurchaseOrderIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get purchase id allowed values', async () => {
      const allowed_values = await getQuickbooksPurchaseIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get refund receipt id allowed values', async () => {
      const allowed_values = await getQuickbooksRefundReceiptIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get sales receipt id allowed values', async () => {
      const allowed_values = await getQuickbooksSalesReceiptIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get vendor id allowed values', async () => {
      const allowed_values = await getQuickbooksVendorIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      vendor_id = allowed_values[0].value;
    });
  });

  describe('Should test Quickbooks actions', () => {
    let created_bill_id: string | undefined;
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

      console.log('Accounts:');
      console.dir(result, { depth: null });
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

      console.log('Bills:');
      console.dir(result, { depth: null });
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
