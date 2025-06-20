import { configDotenv } from 'dotenv';
import {
  archivePaddleProduct,
  createPaddleCustomer,
  createPaddlePrice,
  createPaddleProduct,
  createPaddleTransaction,
  getPaddleCustomer,
  getPaddleCustomerAuthToken,
  getPaddlePrice,
  getPaddleProduct,
  getPaddleSubscription,
  getPaddleTransaction,
  listPaddleCustomers,
  listPaddlePrices,
  listPaddleProducts,
  listPaddleSubscriptions,
  listPaddleTransactions,
  updatePaddleCustomer,
  updatePaddlePrice,
  updatePaddleProduct,
} from '../apps/paddle/actions';
import { PADDLE_INSTANCE_TYPE } from '../apps/paddle/constants';
import { createPaddleClient } from '../apps/paddle/helpers/constants';
import { getPaddleCustomerIdAllowedValues } from '../apps/paddle/helpers/get-customer-id-allowed-values';
import { getPaddleDiscountIdAllowedValues } from '../apps/paddle/helpers/get-discount-id-allowed-values';
import { getPaddlePriceIdAllowedValues } from '../apps/paddle/helpers/get-price-id-allowed-values';
import { getPaddleProductIdAllowedValues } from '../apps/paddle/helpers/get-product-id-allowed-values';
import { getPaddleTransactionIdAllowedValues } from '../apps/paddle/helpers/get-transaction-id-allowed-values';

configDotenv({ path: '.env' });

describe('Test Paddle Actions', () => {
  const base_context = {
    conn_opts: {
      instance_type: '',
      token: '',
    } as any,
  };

  beforeAll(() => {
    const instance_type = PADDLE_INSTANCE_TYPE.sandbox;
    const token = process.env.PADDLE_SANDBOX_API_KEY;

    if (!token) {
      throw new Error(`Please set the PADDLE_SANDBOX_API_KEY environment variable.`);
    }

    base_context.conn_opts.instance_type = instance_type;
    base_context.conn_opts.token = token;
  });

  let product_id: string | undefined;
  let price_id: string | undefined;
  describe('Should test Paddle allowed values', () => {
    it('Should get product allowed values', async () => {
      const allowed_values = await getPaddleProductIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);

      product_id = allowed_values[0].value;
    });

    it('Should get price allowed values', async () => {
      const allowed_values = await getPaddlePriceIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      price_id = allowed_values[0].value;
    });

    it('Should get customer allowed values', async () => {
      const allowed_values = await getPaddleCustomerIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get paddle transaction allowed values', async () => {
      const allowed_values = await getPaddleTransactionIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });

    it('Should get paddle discount allowed values', async () => {
      const allowed_values = await getPaddleDiscountIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
    });
  });

  let created_product_id: string | undefined;
  let created_price_id: string | undefined;
  let created_customer_id: string | undefined;
  let created_transaction_id: string | undefined;
  describe('Should test Paddle actions', () => {
    describe('Should test Paddle products', () => {
      it('Should get a product', async () => {
        const action = getPaddleProduct;
        if (!('api_function' in action)) throw new Error('api_function not found in action');
        const result = await action.api_function(
          {
            product_id,
            include_prices: true,
          },
          undefined,
          base_context
        );
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });

      it('Should create a product', async () => {
        const action = createPaddleProduct;

        if (!('api_function' in action)) throw new Error('api_function not found in action');
        const name = `[To Delete] Test Product ${Date.now()}`;
        const result = await action.api_function(
          {
            name,
            tax_category: 'standard',
            description: 'This is a test product for Paddle integration.',
            type: 'standard',
            image_url: 'https://example.com/image.png',
            custom_data: { key: 'value' },
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.name).toBe(name);

        created_product_id = result.id;
      });

      it('Should list products', async () => {
        const action = listPaddleProducts;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            per_page: 1,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });

      it('Should update a product', async () => {
        const action = updatePaddleProduct;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const name = `[To Delete] Updated Test Product`;

        const result = await action.api_function(
          {
            product_id: created_product_id,
            name,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.name).toBe(name);
      });
    });

    describe('Should test Paddle prices', () => {
      it('Should get a price', async () => {
        const action = getPaddlePrice;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            price_id,
            include_product: true,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.productId).toBeDefined();
      });

      it('Should create a price', async () => {
        const action = createPaddlePrice;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            product_id: created_product_id,
            description: 'Test Price for Paddle Integration',
            unit_price: {
              amount: '1000',
              currencyCode: 'USD',
            },
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.productId).toBe(created_product_id);

        created_price_id = result.id;
      });

      it('Should update a price', async () => {
        const action = updatePaddlePrice;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const description = 'Updated Test Price for Paddle Integration';
        const result = await action.api_function(
          {
            price_id: created_price_id,
            description,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.description).toBe(description);
      });

      it('Should list prices', async () => {
        const action = listPaddlePrices;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            per_page: 1,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });
    });

    describe('Should test Paddle customers', () => {
      it('Should create a customer', async () => {
        const action = createPaddleCustomer;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const email = `test-${Date.now()}@example.com`;
        const result = await action.api_function(
          {
            email,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.email).toBe(email);

        created_customer_id = result.id;
      });

      it('Should update a customer', async () => {
        const action = updatePaddleCustomer;
        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const name = `Updated Test Customer ${Date.now()}`;

        const result = await action.api_function(
          {
            customer_id: created_customer_id,
            name,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.name).toBe(name);
      });
      it('Should get a customer', async () => {
        const action = getPaddleCustomer;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            customer_id: created_customer_id,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.email).toBeDefined();
      });

      // Requires a customer with credit balance

      // it('Should list a customer credit balances', async () => {
      //   const action = listPaddleCustomerCreditBalances;

      //   if (!('api_function' in action)) throw new Error('api_function not found in action');

      //   const result = await action.api_function(
      //     {
      //       customer_id,
      //     },
      //     undefined,
      //     base_context
      //   );

      //   expect(result).toBeDefined();
      //   expect(result.customerId).toBeDefined();
      //   expect(result.balance).toBeDefined();
      // });

      it('Should get a customer auth token', async () => {
        const action = getPaddleCustomerAuthToken;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            customer_id: created_customer_id,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.customerAuthToken).toBeDefined();
      });

      it('Should list customers', async () => {
        const action = listPaddleCustomers;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            per_page: 1,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });
    });

    describe('Should test Paddle transactions', () => {
      it('Should create a transaction', async () => {
        const action = createPaddleTransaction;

        if (!('api_function' in action)) throw new Error('api_function not found in action');
        if (!created_price_id || !created_customer_id) {
          throw new Error('created_price_id or created_customer_id is not defined');
        }

        const result = await action.api_function(
          {
            items: [
              {
                price_id: created_price_id,
                quantity: 1,
              },
            ],
            customer_id: created_customer_id,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();

        created_transaction_id = result.id;
      });
      it('Should get a transaction', async () => {
        const action = getPaddleTransaction;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            include: [
              'address',
              'adjustments',
              'adjustments_totals',
              'available_payment_methods',
              'business',
              'customer',
              'discount',
            ],
            transaction_id: created_transaction_id,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });

      it('Should list transactions', async () => {
        const action = listPaddleTransactions;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            per_page: 1,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });
    });

    // Report creation requires time to process + they expire after a certain time
    // let created_report_id: string | undefined;
    // describe('Should test Paddle reports', () => {
    //   it('Should create a report', async () => {
    //     const action = createPaddleReport;

    //     if (!('api_function' in action)) throw new Error('api_function not found in action');

    //     const result = await action.api_function(
    //       {
    //         type: 'products_prices',
    //       },
    //       undefined,
    //       base_context
    //     );
    //     expect(result).toBeDefined();
    //     expect(result.id).toBeDefined();
    //     created_report_id = result.id;
    //   });

    //   it('Should get a report', async () => {
    //     const action = getPaddleReport;

    //     if (!('api_function' in action)) throw new Error('api_function not found in action');

    //     if (!created_report_id) throw new Error('created_report_id is not defined');

    //     const result = await action.api_function(
    //       {
    //         report_id: created_report_id,
    //       },
    //       undefined,
    //       base_context
    //     );

    //     expect(result).toBeDefined();
    //     expect(result.id).toBe(created_report_id);
    //   });

    //   it('Should list reports', async () => {
    //     const action = listPaddleReports;

    //     if (!('api_function' in action)) throw new Error('api_function not found in action');

    //     const result = await action.api_function(
    //       {
    //         per_page: 1,
    //       },
    //       undefined,
    //       base_context
    //     );

    //     expect(result).toBeDefined();
    //     expect(Array.isArray(result)).toBe(true);
    //     expect(result.length).toBeGreaterThan(0);
    //   });

    //   it('Should get a report file', async () => {
    //     const action = getPaddleReportFile;

    //     if (!('api_function' in action)) throw new Error('api_function not found in action');

    //     if (!created_report_id) throw new Error('created_report_id is not defined');

    //     const result = await action.api_function(
    //       {
    //         report_id: created_report_id,
    //       },
    //       undefined,
    //       base_context
    //     );

    //     expect(result).toBeDefined();
    //   });
    // });

    describe('Should test Paddle subscriptions', () => {
      let subscription_id: string | undefined;
      it('Should list subscriptions', async () => {
        const action = listPaddleSubscriptions;

        if (!('api_function' in action)) throw new Error('api_function not found in action');

        const result = await action.api_function(
          {
            per_page: 1,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        subscription_id = result[0].id;
      });
      it('Should get a subscription', async () => {
        const action = getPaddleSubscription;

        if (!('api_function' in action)) throw new Error('api_function not found in action');
        const result = await action.api_function(
          {
            subscription_id: subscription_id,
            include: ['next_transaction', 'recurring_transaction_details'],
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });
    });
  });

  describe('Should clean up', () => {
    it('Should archive the created price', async () => {
      const client = createPaddleClient(
        base_context.conn_opts.token,
        base_context.conn_opts.instance_type
      );

      if (!created_price_id) throw new Error('created_price_id is not defined');

      await client.prices.archive(created_price_id);
    });

    it('Should archive the created customer', async () => {
      const client = createPaddleClient(
        base_context.conn_opts.token,
        base_context.conn_opts.instance_type
      );

      if (!created_customer_id) throw new Error('created_customer_id is not defined');

      await client.customers.archive(created_customer_id);
    });

    it('Should archive a product', async () => {
      const action = archivePaddleProduct;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          product_id: created_product_id,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });
});
