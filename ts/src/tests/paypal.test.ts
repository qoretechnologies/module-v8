import { TQoreAppActionWithWebhook } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import {
  CreatePayPalInvoice,
  CreatePayPalOrder,
  GetPayPalInvoice,
  GetPayPalOrder,
  ListPayPalDisputes,
  ListPayPalInvoices,
  ListPayPalTransactions,
} from '../apps/paypal/actions';
import { PayPalOrderTrigger } from '../apps/paypal/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { getPayPalInvoiceAllowedValues } from '../apps/paypal/helpers/get-invoice-id-allowed-values';
configDotenv({ path: '.env' });

describe('Should test PayPal actions', () => {
  Debugger.level = DebugLevels.Verbose;
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  const base_context = {
    conn_opts: {
      token: '',
      environment: 'api-m.sandbox',
    } as any,
  };

  beforeAll(async () => {
    if (!clientId || !clientSecret) {
      throw new Error('PayPal credentials are not provided');
    }

    const data: {
      grant_type: string;
    } = {
      grant_type: 'client_credentials',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key as keyof typeof data])
      )
      .join('&');

    const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: formBody,
    });

    const responseData = await response.json();
    if (!responseData?.access_token) {
      throw new Error('Failed to get access token');
    }

    base_context.conn_opts.token = responseData.access_token;
  });

  describe('Should test allowed values', () => {
    it('Should get invoice allowed values', async () => {
      const allowedValues = await getPayPalInvoiceAllowedValues(base_context);

      expect(allowedValues).toBeDefined();
      expect(Array.isArray(allowedValues)).toBe(true);
      expect(allowedValues.length).toBeGreaterThan(0);
    });
  });

  describe('Should test actions', () => {
    let createdOrderId: string;
    let invoiceId: string;
    it('Should list transactions', async () => {
      const action = ListPayPalTransactions;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          start_date: '2025-09-01T00:00:00.000Z',
          end_date: '2025-09-24T23:00:00.000Z',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.transactions).toBeDefined();
      expect(Array.isArray(result.transactions)).toBe(true);
    });

    it('Should create an invoice', async () => {
      const action = CreatePayPalInvoice;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          invoice_number: `INV-${Date.now()}`,
          currency_code: 'USD',
          note: 'Thank you for your business! Payment due upon receipt.',
          recipient_email: 'sb-7ey2145979996@business.example.com',
          recipient_first_name: 'John',
          recipient_last_name: 'Smith',
          item_name: 'Web Design Services',
          item_description: 'Custom website design and development',
          item_quantity: '1',
          item_unit_price: '1500.00',
          tax_percent: '8.5',
          payment_term: 'NET_30',
          send_to_recipient: false,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should list invoices', async () => {
      const action = ListPayPalInvoices;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(undefined, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.invoices).toBeDefined();
      expect(Array.isArray(result.invoices)).toBe(true);

      if (result.invoices.length > 0) {
        invoiceId = result.invoices[0].id;
      }
    });

    it('Should get an invoice', async () => {
      const action = GetPayPalInvoice;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!invoiceId) throw new Error('No invoice ID to test');

      const result = await action.api_function(
        {
          invoice_id: invoiceId,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toBe(invoiceId);
    });

    it('Should create an order', async () => {
      const action = CreatePayPalOrder;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          intent: 'CAPTURE',
          currency_code: 'USD',
          total_amount: '149.13',
          item_total: '119.97',
          shipping_amount: '9.99',
          tax_total: '19.17',
          description: 'T-shirts and accessories order',
          custom_id: 'ORDER-2024-001234',
          invoice_id: 'INV-2024-5679',
          soft_descriptor: 'MYSTORE*TSHIRTS',
          items: [
            {
              name: 'Premium Cotton T-Shirt',
              quantity: '2',
              unit_price: '29.99',
              description: '100% organic cotton, various colors',
              sku: 'TSHIRT-PREM-001',
              category: 'PHYSICAL_GOODS',
              tax_amount: '6.39',
            },
            {
              name: 'Baseball Cap',
              quantity: '1',
              unit_price: '59.99',
              description: 'Adjustable baseball cap with logo',
              sku: 'CAP-BASE-002',
              category: 'PHYSICAL_GOODS',
              tax_amount: '6.39',
            },
          ] as any,
          shipping_type: 'SHIPPING',
          shipping_name: 'John Smith',
          shipping_address_line_1: '123 Main Street',
          shipping_address_line_2: 'Apt 4B',
          shipping_city: 'New York',
          shipping_state: 'NY',
          shipping_postal_code: '10001',
          shipping_country_code: 'US',
          payee_email: 'sb-7ey2145979996@business.example.com',
          return_url: 'https://example.com/return',
          cancel_url: 'https://example.com/cancel',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      createdOrderId = result.id;
    });

    it('Should get an order', async () => {
      const action = GetPayPalOrder;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          order_id: createdOrderId,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toBe(createdOrderId);
    });

    it('Should list disputes', async () => {
      const action = ListPayPalDisputes;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(undefined, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.disputes).toBeDefined();
    });

    describe('Should test triggers', () => {
      describe('Order Trigger', () => {
        let regInfo: Record<string, any> | undefined | void;

        it('Should register trigger', async () => {
          const trigger = PayPalOrderTrigger;

          if (!('webhook_register' in trigger))
            throw new Error('webhook_register not found in trigger');

          regInfo = await trigger.webhook_register(
            { ...base_context, opts: { event_name: 'CHECKOUT.ORDER.APPROVED' } as any },
            'https://example.com/webhook'
          );

          expect(regInfo).toBeDefined();
          expect(regInfo?.webhookId).toBeDefined();
        });

        it('Should deregister trigger', async () => {
          const trigger = PayPalOrderTrigger as TQoreAppActionWithWebhook;
          await trigger.webhook_deregister(base_context, 'https://example.com/webhook', regInfo!);
          regInfo = undefined;
        });

        it('Should get example event data for trigger', async () => {
          const trigger = PayPalOrderTrigger;

          if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
            throw new Error('get_example_event_data not found in trigger');

          const result = await trigger.get_example_event_data({
            ...base_context,
            opts: { event_name: 'CHECKOUT.ORDER.APPROVED' } as any,
          });

          expect(result).toBeDefined();
          expect(result.event_type).toBe('CHECKOUT.ORDER.APPROVED');
        });
      });
    });
  });
});
