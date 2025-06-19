import {
  archivePaddleProduct,
  createPaddlePrice,
  createPaddleProduct,
  getPaddlePrice,
  getPaddleProduct,
  listPaddleProducts,
  updatePaddlePrice,
  updatePaddleProduct,
} from '../apps/paddle/actions';
import { PADDLE_INSTANCE_TYPE } from '../apps/paddle/constants';
import { createPaddleClient } from '../apps/paddle/helpers/constants';
import { getPaddlePriceIdAllowedValues } from '../apps/paddle/helpers/get-price-id-allowed-values';
import { getPaddleProductIdAllowedValues } from '../apps/paddle/helpers/get-product-id-allowed-values';

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
  });

  let created_product_id: string | undefined;
  let created_price_id: string | undefined;
  describe('Should test Paddle actions', () => {
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
            amount: '10',
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
  });

  describe('Should clean up', () => {
    it('Should delete the archive the created price', async () => {
      const client = createPaddleClient(
        base_context.conn_opts.token,
        base_context.conn_opts.instance_type
      );

      if (!created_price_id) throw new Error('created_price_id is not defined');

      await client.prices.archive(created_price_id);
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
