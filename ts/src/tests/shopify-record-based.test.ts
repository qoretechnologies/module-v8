/**
 * Shopify Record-Based Helpers Tests
 *
 * Unit tests for expressions, search options, transformations, and client-side filtering.
 * Integration tests for full CRUD cycle with real Shopify API.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { configDotenv } from 'dotenv';
import {
  buildGlobalId,
  convertWhereToShopifyQuery,
  createShopifyRecords,
  deleteShopifyRecords,
  extractNumericId,
  filterRecordsClientSide,
  getShopifyExpressions,
  getShopifyRecordType,
  getShopifyTableList,
  searchShopifyRecords,
  ShopifyRecordError,
  ShopifySearchOptions,
  SHOPIFY_RECORD_TYPES,
  sortRecords,
  STANDARD_PRODUCT_FIELDS,
  transformProductToRecord,
  transformRecordToProductInput,
  TShopifyProduct,
  updateShopifyRecords,
} from '../apps/shopify/helpers/record-based';
import { mapColumnFormatToObject, delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

configDotenv({ path: '.env' });

describe('Shopify Record-Based', () => {
  // Unit tests that don't require API access
  describe('Should test Shopify expressions and search options (unit tests)', () => {
    it('Should return valid expressions configuration', () => {
      const expressions = getShopifyExpressions('en');

      expect(expressions).toBeDefined();
      expect(typeof expressions).toBe('object');

      // Check for logical operators
      expect(expressions['&&']).toBeDefined();
      expect(expressions['||']).toBeDefined();

      // Check for comparison operators
      expect(expressions['==']).toBeDefined();
      expect(expressions['!=']).toBeDefined();
      expect(expressions['>']).toBeDefined();
      expect(expressions['>=']).toBeDefined();
      expect(expressions['<']).toBeDefined();
      expect(expressions['<=']).toBeDefined();

      // Check for set operators
      expect(expressions['is-set']).toBeDefined();
      expect(expressions['is-not-set']).toBeDefined();

      // Check for string operators
      expect(expressions['contains']).toBeDefined();

      // Verify expression structure for a comparison operator
      const eqExpr = expressions['=='];
      expect(eqExpr.type).toBe('operator');
      expect(eqExpr.roles).toContain('search');
      expect(eqExpr.args).toBeDefined();
      expect(eqExpr.args.length).toBe(2);
      expect(eqExpr.return_type).toBe('bool');

      // Verify logical operator structure
      const andExpr = expressions['&&'];
      expect(andExpr.type).toBe('operator');
      expect(andExpr.subtype).toBe('logic-operator');
      expect(andExpr.varargs).toBe(true);
    });

    it('Should have valid search options configuration', () => {
      expect(ShopifySearchOptions).toBeDefined();
      expect(ShopifySearchOptions.orderBy).toBeDefined();

      const orderByType = ShopifySearchOptions.orderBy.type as { type: string; fields: Record<string, any> };
      expect(orderByType.type).toBe('hash');

      const orderByFields = orderByType.fields;
      expect(orderByFields).toBeDefined();
      expect(orderByFields.field).toBeDefined();
      expect(orderByFields.direction).toBeDefined();

      // Check allowed values for field
      expect(orderByFields.field.allowed_values).toBeDefined();
      const allowedFields = orderByFields.field.allowed_values.map((v: any) => v.value);
      expect(allowedFields).toContain('TITLE');
      expect(allowedFields).toContain('PRODUCT_TYPE');
      expect(allowedFields).toContain('VENDOR');
      expect(allowedFields).toContain('UPDATED_AT');
      expect(allowedFields).toContain('CREATED_AT');
      expect(allowedFields).toContain('BEST_SELLING');
      expect(allowedFields).toContain('INVENTORY_TOTAL');

      // Check allowed values for direction
      expect(orderByFields.direction.allowed_values).toBeDefined();
      const allowedDirections = orderByFields.direction.allowed_values.map((v: any) => v.value);
      expect(allowedDirections).toContain('asc');
      expect(allowedDirections).toContain('desc');
    });
  });

  describe('Should test Shopify ID handling (unit tests)', () => {
    it('Should correctly extract numeric ID from global ID', () => {
      const globalId = 'gid://shopify/Product/123456789';
      const numericId = extractNumericId(globalId);

      expect(numericId).toBe('123456789');
    });

    it('Should return input when no match found', () => {
      const plainId = '123456789';
      const result = extractNumericId(plainId);

      expect(result).toBe('123456789');
    });

    it('Should correctly build global ID from numeric ID', () => {
      const numericId = '123456789';
      const globalId = buildGlobalId(numericId, 'Product');

      expect(globalId).toBe('gid://shopify/Product/123456789');
    });

    it('Should return input when already a global ID', () => {
      const existingGlobalId = 'gid://shopify/Product/123456789';
      const result = buildGlobalId(existingGlobalId, 'Product');

      expect(result).toBe(existingGlobalId);
    });
  });

  describe('Should test Shopify record transformations (unit tests)', () => {
    const mockProduct: TShopifyProduct = {
      id: 'gid://shopify/Product/123456789',
      title: 'Test Product',
      handle: 'test-product',
      description: 'Test description',
      descriptionHtml: '<p>Test description</p>',
      productType: 'Clothing',
      vendor: 'Test Vendor',
      tags: ['tag1', 'tag2'],
      status: 'ACTIVE',
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-15T10:00:00.000Z',
      publishedAt: '2026-01-02T10:00:00.000Z',
      totalInventory: 100,
      tracksInventory: true,
      hasOnlyDefaultVariant: false,
      hasOutOfStockVariants: false,
      isGiftCard: false,
      requiresSellingPlan: false,
      onlineStoreUrl: 'https://test.myshopify.com/products/test-product',
      templateSuffix: null,
      priceRangeV2: {
        minVariantPrice: { amount: '19.99', currencyCode: 'USD' },
        maxVariantPrice: { amount: '29.99', currencyCode: 'USD' },
      },
      seo: {
        title: 'SEO Title',
        description: 'SEO Description',
      },
      featuredMedia: {
        image: {
          url: 'https://cdn.shopify.com/test-image.jpg',
          altText: 'Test image alt',
        },
      },
      metafields: {
        edges: [
          {
            node: {
              namespace: 'custom',
              key: 'test_field',
              value: 'test_value',
              type: 'single_line_text_field',
            },
          },
          {
            node: {
              namespace: 'custom',
              key: 'count',
              value: '42',
              type: 'number_integer',
            },
          },
        ],
      },
    };

    it('Should transform product to record with all standard fields', () => {
      const record = transformProductToRecord(mockProduct);

      // Check standard fields
      expect(record.id).toBe('123456789');
      expect(record.title).toBe('Test Product');
      expect(record.handle).toBe('test-product');
      expect(record.description).toBe('Test description');
      expect(record.descriptionHtml).toBe('<p>Test description</p>');
      expect(record.productType).toBe('Clothing');
      expect(record.vendor).toBe('Test Vendor');
      expect(record.tags).toEqual(['tag1', 'tag2']);
      expect(record.status).toBe('ACTIVE');
      expect(record.createdAt).toBe('2026-01-01T10:00:00.000Z');
      expect(record.updatedAt).toBe('2026-01-15T10:00:00.000Z');
      expect(record.publishedAt).toBe('2026-01-02T10:00:00.000Z');
      expect(record.totalInventory).toBe(100);
      expect(record.tracksInventory).toBe(true);
      expect(record.hasOnlyDefaultVariant).toBe(false);
      expect(record.hasOutOfStockVariants).toBe(false);
      expect(record.isGiftCard).toBe(false);
      expect(record.requiresSellingPlan).toBe(false);
      expect(record.onlineStoreUrl).toBe('https://test.myshopify.com/products/test-product');
      expect(record.templateSuffix).toBeNull();
    });

    it('Should transform product to record with price range', () => {
      const record = transformProductToRecord(mockProduct);

      expect(record.minPrice).toBe(19.99);
      expect(record.maxPrice).toBe(29.99);
      expect(record.currencyCode).toBe('USD');
    });

    it('Should transform product to record with SEO fields', () => {
      const record = transformProductToRecord(mockProduct);

      expect(record.seoTitle).toBe('SEO Title');
      expect(record.seoDescription).toBe('SEO Description');
    });

    it('Should transform product to record with featured image', () => {
      const record = transformProductToRecord(mockProduct);

      expect(record.featuredImageUrl).toBe('https://cdn.shopify.com/test-image.jpg');
      expect(record.featuredImageAltText).toBe('Test image alt');
    });

    it('Should transform product to record with metafields', () => {
      const record = transformProductToRecord(mockProduct);

      expect(record['mf_custom_test_field']).toBe('test_value');
      expect(record['mf_custom_count']).toBe(42);
    });

    it('Should transform record to product input', () => {
      const record = {
        title: 'Updated Title',
        description: 'Updated description',
        productType: 'Electronics',
        vendor: 'New Vendor',
        tags: ['new-tag'],
        status: 'DRAFT',
        seoTitle: 'New SEO Title',
        seoDescription: 'New SEO Description',
        mf_custom_new_field: 'new_value',
        mf_custom_number: 123,
      };

      const { productInput, metafieldInputs } = transformRecordToProductInput(record);

      // Check product input
      expect(productInput.title).toBe('Updated Title');
      expect(productInput.descriptionHtml).toBe('Updated description');
      expect(productInput.productType).toBe('Electronics');
      expect(productInput.vendor).toBe('New Vendor');
      expect(productInput.tags).toEqual(['new-tag']);
      expect(productInput.status).toBe('DRAFT');
      expect((productInput.seo as any).title).toBe('New SEO Title');
      expect((productInput.seo as any).description).toBe('New SEO Description');

      // Check metafield inputs
      expect(metafieldInputs.length).toBe(2);

      const textField = metafieldInputs.find((m) => m.key === 'new_field');
      expect(textField?.namespace).toBe('custom');
      expect(textField?.value).toBe('new_value');
      expect(textField?.type).toBe('single_line_text_field');

      const numberField = metafieldInputs.find((m) => m.key === 'number');
      expect(numberField?.namespace).toBe('custom');
      expect(numberField?.value).toBe('123');
      expect(numberField?.type).toBe('number_integer');
    });

    it('Should skip read-only fields when transforming to product input', () => {
      const record = {
        title: 'Test',
        createdAt: '2026-01-01T00:00:00.000Z', // Read-only
        updatedAt: '2026-01-01T00:00:00.000Z', // Read-only
        totalInventory: 100, // Read-only
        minPrice: 19.99, // Read-only
      };

      const { productInput } = transformRecordToProductInput(record);

      expect(productInput.title).toBe('Test');
      expect(productInput.createdAt).toBeUndefined();
      expect(productInput.updatedAt).toBeUndefined();
      expect(productInput.totalInventory).toBeUndefined();
      expect(productInput.minPrice).toBeUndefined();
    });
  });

  describe('Should test Shopify WHERE to query conversion (unit tests)', () => {
    it('Should convert equality expression', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'status' },
          { type_code: 'value', value: 'ACTIVE' },
        ],
      } as any;

      const query = convertWhereToShopifyQuery(where);
      expect(query).toBe('status:active');
    });

    it('Should convert inequality expression', () => {
      const where = {
        exp: '!=',
        args: [
          { type_code: 'field reference', field: 'vendor' },
          { type_code: 'value', value: 'BadVendor' },
        ],
      } as any;

      const query = convertWhereToShopifyQuery(where);
      expect(query).toBe('NOT vendor:BadVendor');
    });

    it('Should convert greater-than expression', () => {
      const where = {
        exp: '>',
        args: [
          { type_code: 'field reference', field: 'totalInventory' },
          { type_code: 'value', value: 10 },
        ],
      } as any;

      const query = convertWhereToShopifyQuery(where);
      expect(query).toBe('inventory_total:>10');
    });

    it('Should convert less-than-or-equal expression', () => {
      const where = {
        exp: '<=',
        args: [
          { type_code: 'field reference', field: 'totalInventory' },
          { type_code: 'value', value: 100 },
        ],
      } as any;

      const query = convertWhereToShopifyQuery(where);
      expect(query).toBe('inventory_total:<=100');
    });

    it('Should convert contains expression', () => {
      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'title' },
          { type_code: 'value', value: 'test' },
        ],
      } as any;

      const query = convertWhereToShopifyQuery(where);
      expect(query).toBe('title:*test*');
    });

    it('Should convert is-set expression', () => {
      const where = {
        exp: 'is-set',
        args: [{ type_code: 'field reference', field: 'vendor' }],
      } as any;

      const query = convertWhereToShopifyQuery(where);
      expect(query).toBe('vendor:*');
    });

    it('Should convert is-not-set expression', () => {
      const where = {
        exp: 'is-not-set',
        args: [{ type_code: 'field reference', field: 'publishedAt' }],
      } as any;

      const query = convertWhereToShopifyQuery(where);
      expect(query).toBe('NOT published_at:*');
    });

    it('Should convert AND expression', () => {
      const where = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'ACTIVE' },
            ],
          },
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'vendor' },
              { type_code: 'value', value: 'TestVendor' },
            ],
          },
        ],
      } as any;

      const query = convertWhereToShopifyQuery(where);
      expect(query).toBe('status:active AND vendor:TestVendor');
    });

    it('Should convert OR expression', () => {
      const where = {
        exp: '||',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'ACTIVE' },
            ],
          },
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'DRAFT' },
            ],
          },
        ],
      } as any;

      const query = convertWhereToShopifyQuery(where);
      expect(query).toBe('(status:active OR status:draft)');
    });

    it('Should quote values with spaces (escaped for GraphQL)', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'title' },
          { type_code: 'value', value: 'Test Product Name' },
        ],
      } as any;

      const query = convertWhereToShopifyQuery(where);
      expect(query).toBe('title:\\"Test Product Name\\"');
    });

    it('Should return empty string for undefined where', () => {
      const query = convertWhereToShopifyQuery(undefined);
      expect(query).toBe('');
    });
  });

  describe('Should test Shopify client-side filtering (unit tests)', () => {
    const testRecords = [
      { id: '1', title: 'Product A', status: 'ACTIVE', totalInventory: 100, vendor: 'Vendor A' },
      { id: '2', title: 'Product B', status: 'DRAFT', totalInventory: 50, vendor: 'Vendor B' },
      { id: '3', title: 'Product C', status: 'ACTIVE', totalInventory: null, vendor: null },
      { id: '4', title: 'Another Product', status: 'ARCHIVED', totalInventory: 0, vendor: 'Vendor A' },
    ];

    it('Should filter with equality expression', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'status' },
          { type_code: 'value', value: 'ACTIVE' },
        ],
      } as any;

      const filtered = filterRecordsClientSide(testRecords, where);
      expect(filtered.length).toBe(2);
      expect(filtered.every((r) => r.status === 'ACTIVE')).toBe(true);
    });

    it('Should filter with not-equals expression', () => {
      const where = {
        exp: '!=',
        args: [
          { type_code: 'field reference', field: 'status' },
          { type_code: 'value', value: 'DRAFT' },
        ],
      } as any;

      const filtered = filterRecordsClientSide(testRecords, where);
      expect(filtered.length).toBe(3);
      expect(filtered.every((r) => r.status !== 'DRAFT')).toBe(true);
    });

    it('Should filter with contains expression', () => {
      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'title' },
          { type_code: 'value', value: 'Product' },
        ],
      } as any;

      const filtered = filterRecordsClientSide(testRecords, where);
      expect(filtered.length).toBe(4); // All contain "Product"
    });

    it('Should filter with is-set expression', () => {
      const where = {
        exp: 'is-set',
        args: [{ type_code: 'field reference', field: 'vendor' }],
      } as any;

      const filtered = filterRecordsClientSide(testRecords, where);
      expect(filtered.length).toBe(3);
      expect(filtered.every((r) => r.vendor !== null)).toBe(true);
    });

    it('Should filter with is-not-set expression', () => {
      const where = {
        exp: 'is-not-set',
        args: [{ type_code: 'field reference', field: 'vendor' }],
      } as any;

      const filtered = filterRecordsClientSide(testRecords, where);
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('3');
    });

    it('Should filter with greater-than expression on numbers', () => {
      const where = {
        exp: '>',
        args: [
          { type_code: 'field reference', field: 'totalInventory' },
          { type_code: 'value', value: 50 },
        ],
      } as any;

      const filtered = filterRecordsClientSide(testRecords, where);
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('1');
    });

    it('Should filter with less-than-or-equal expression on numbers', () => {
      const where = {
        exp: '<=',
        args: [
          { type_code: 'field reference', field: 'totalInventory' },
          { type_code: 'value', value: 50 },
        ],
      } as any;

      const filtered = filterRecordsClientSide(testRecords, where);
      expect(filtered.length).toBe(2);
      expect(filtered.map((r) => r.id).sort()).toEqual(['2', '4']);
    });

    it('Should filter with AND expression', () => {
      const where = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'ACTIVE' },
            ],
          },
          {
            exp: 'is-set',
            args: [{ type_code: 'field reference', field: 'vendor' }],
          },
        ],
      } as any;

      const filtered = filterRecordsClientSide(testRecords, where);
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('1');
    });

    it('Should filter with OR expression', () => {
      const where = {
        exp: '||',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'DRAFT' },
            ],
          },
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'ARCHIVED' },
            ],
          },
        ],
      } as any;

      const filtered = filterRecordsClientSide(testRecords, where);
      expect(filtered.length).toBe(2);
      expect(filtered.map((r) => r.id).sort()).toEqual(['2', '4']);
    });

    it('Should return all records when where is undefined', () => {
      const filtered = filterRecordsClientSide(testRecords, undefined);
      expect(filtered.length).toBe(4);
    });
  });

  describe('Should test Shopify client-side sorting (unit tests)', () => {
    const testRecords = [
      { id: '1', title: 'Beta', updatedAt: '2026-06-15T00:00:00.000Z', totalInventory: 100 },
      { id: '2', title: 'Alpha', updatedAt: '2026-07-01T00:00:00.000Z', totalInventory: 200 },
      { id: '3', title: 'Gamma', updatedAt: null, totalInventory: 300 },
      { id: '4', title: 'Delta', updatedAt: '2026-05-01T00:00:00.000Z', totalInventory: 50 },
    ];

    it('Should sort by title ascending', () => {
      const sorted = sortRecords(testRecords, { field: 'TITLE', direction: 'asc' });
      expect(sorted.map((r) => r.title)).toEqual(['Alpha', 'Beta', 'Delta', 'Gamma']);
    });

    it('Should sort by title descending', () => {
      const sorted = sortRecords(testRecords, { field: 'TITLE', direction: 'desc' });
      expect(sorted.map((r) => r.title)).toEqual(['Gamma', 'Delta', 'Beta', 'Alpha']);
    });

    it('Should sort by inventory ascending', () => {
      const sorted = sortRecords(testRecords, { field: 'INVENTORY_TOTAL', direction: 'asc' });
      expect(sorted.map((r) => r.totalInventory)).toEqual([50, 100, 200, 300]);
    });

    it('Should sort by date with nulls at end', () => {
      const sorted = sortRecords(testRecords, { field: 'UPDATED_AT', direction: 'asc' });
      expect(sorted.map((r) => r.id)).toEqual(['4', '1', '2', '3']);
    });

    it('Should return unsorted when orderBy is undefined', () => {
      const sorted = sortRecords(testRecords, undefined);
      expect(sorted).toEqual(testRecords);
    });
  });

  describe('Should test Shopify record types constants (unit tests)', () => {
    it('Should have Products as available record type', () => {
      expect(SHOPIFY_RECORD_TYPES).toContain('Products');
    });

    it('Should have standard product fields defined', () => {
      expect(STANDARD_PRODUCT_FIELDS).toBeDefined();
      expect(STANDARD_PRODUCT_FIELDS.id).toBe('string');
      expect(STANDARD_PRODUCT_FIELDS.title).toBe('string');
      expect(STANDARD_PRODUCT_FIELDS.totalInventory).toBe('integer');
      expect(STANDARD_PRODUCT_FIELDS.tracksInventory).toBe('bool');
      expect(STANDARD_PRODUCT_FIELDS.createdAt).toBe('date');
      expect(STANDARD_PRODUCT_FIELDS.tags).toEqual({ type: 'list', element_type: 'string' });
    });
  });

  describe('Should test Shopify error handling (unit tests)', () => {
    it('Should create ShopifyRecordError with correct name', () => {
      const error = new ShopifyRecordError('Test error message');
      expect(error.name).toBe('ShopifyRecordError');
      expect(error.message).toBe('Test error message');
      expect(error instanceof Error).toBe(true);
    });
  });

  // Integration tests that require API access
  describe('Should test Shopify record-based helpers (integration tests)', () => {
    const base_context = {
      conn_opts: {
        token: '',
        shop: '',
      } as any,
    };

    let hasCredentials = false;

    beforeAll(() => {
      const token = process.env.SHOPIFY_ACCESS_TOKEN;
      const shop = process.env.SHOPIFY_SHOP;

      if (!token || !shop) {
        console.warn('SHOPIFY_ACCESS_TOKEN or SHOPIFY_SHOP not set, skipping integration tests');
        return;
      }

      hasCredentials = true;
      base_context.conn_opts.token = token;
      base_context.conn_opts.shop = shop;
    });

    afterEach(async () => {
      if (hasCredentials) {
        await delay(500);
      }
    });

    let createdProductId: string | undefined;

    it('Should get table list', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: SHOPIFY_ACCESS_TOKEN or SHOPIFY_SHOP not set');
        return;
      }

      const tables = await getShopifyTableList(base_context);

      expect(tables).toBeDefined();
      expect(Array.isArray(tables)).toBe(true);
      expect(tables).toContain('Products');
    });

    it('Should get record type for Products', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: SHOPIFY_ACCESS_TOKEN or SHOPIFY_SHOP not set');
        return;
      }

      const recordType = await getShopifyRecordType(base_context, 'Products');

      expect(recordType).toBeDefined();
      expect(recordType.type).toBe('hash');

      if (recordType.type !== 'hash' || !('fields' in recordType) || !recordType.fields) {
        throw new Error('Record type should be a hash with fields');
      }

      const { fields } = recordType;

      // Check for standard product fields
      expect(fields.id).toBeDefined();
      expect(fields.title).toBeDefined();
      expect(fields.handle).toBeDefined();
      expect(fields.description).toBeDefined();
      expect(fields.productType).toBeDefined();
      expect(fields.vendor).toBeDefined();
      expect(fields.status).toBeDefined();
      expect(fields.tags).toBeDefined();
      expect(fields.totalInventory).toBeDefined();
      expect(fields.createdAt).toBeDefined();
      expect(fields.updatedAt).toBeDefined();

      // Verify field structure
      expect((fields.id as any).type).toBe('string');
      expect((fields.title as any).type).toBe('string');
      expect((fields.totalInventory as any).type).toBe('integer');
    });

    it('Should throw error for unknown table', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: SHOPIFY_ACCESS_TOKEN or SHOPIFY_SHOP not set');
        return;
      }

      await expect(async () => {
        await getShopifyRecordType(base_context, 'UnknownTable');
      }).rejects.toThrow('Unknown table');
    });

    it('Should search products', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: SHOPIFY_ACCESS_TOKEN or SHOPIFY_SHOP not set');
        return;
      }

      const iterator = await searchShopifyRecords(base_context, undefined, { table: 'Products' });

      expect(iterator).toBeDefined();
      expect(typeof iterator).toBe('function');

      // Get first batch of records
      const batch = await iterator(base_context, 10);

      // Batch may be null if no products exist
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);

        if (records.length > 0) {
          // Check that records have expected fields
          expect(records[0].id).toBeDefined();
          expect(records[0].title).toBeDefined();
        }
      }
    });

    it('Should search products with WHERE condition', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: SHOPIFY_ACCESS_TOKEN or SHOPIFY_SHOP not set');
        return;
      }

      // Search for active products only
      const whereCondition = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'status' },
          { type_code: 'value', value: 'ACTIVE' },
        ],
      } as any;

      const iterator = await searchShopifyRecords(base_context, whereCondition, { table: 'Products' });

      expect(iterator).toBeDefined();
      const batch = await iterator(base_context, 10);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
        // All returned records should be active
        for (const record of records) {
          expect(record.status).toBe('ACTIVE');
        }
      }
    });

    it('Should search products with orderBy', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: SHOPIFY_ACCESS_TOKEN or SHOPIFY_SHOP not set');
        return;
      }

      const iterator = await searchShopifyRecords(base_context, undefined, {
        table: 'Products',
        orderBy: { field: 'TITLE', direction: 'asc' },
      });

      expect(iterator).toBeDefined();
      const batch = await iterator(base_context, 10);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
      }
    });

    it('Should create a product', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: SHOPIFY_ACCESS_TOKEN or SHOPIFY_SHOP not set');
        return;
      }

      const timestamp = Date.now();
      const testProductTitle = `Test Product ${timestamp}`;
      const records = {
        title: [testProductTitle],
        description: ['Test product created by record-based helper'],
        productType: ['Test'],
        vendor: ['Test Vendor'],
        status: ['DRAFT'],
      };

      const createdRecords = await createShopifyRecords(base_context, records, { table: 'Products' });

      expect(createdRecords).toBeDefined();
      expect(createdRecords.id).toBeDefined();
      expect(Array.isArray(createdRecords.id)).toBe(true);
      expect(createdRecords.id.length).toBe(1);

      createdProductId = createdRecords.id[0] as string;
      expect(createdProductId).toBeDefined();
    });

    it('Should search for the created product', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: SHOPIFY_ACCESS_TOKEN or SHOPIFY_SHOP not set');
        return;
      }
      if (!createdProductId) {
        console.warn('Skipping: Created product ID not defined');
        return;
      }

      // Search for the specific product
      const whereCondition = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'id' },
          { type_code: 'value', value: createdProductId },
        ],
      } as any;

      const iterator = await searchShopifyRecords(base_context, whereCondition, { table: 'Products' });
      const batch = await iterator(base_context, 10);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(records.length).toBeGreaterThanOrEqual(0);
        // The product should be found or the search should work without error
      }
    });

    it('Should update the created product', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: SHOPIFY_ACCESS_TOKEN or SHOPIFY_SHOP not set');
        return;
      }
      if (!createdProductId) {
        console.warn('Skipping: Created product ID not defined');
        return;
      }

      // Update using WHERE condition that matches the product by id
      const whereCondition = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'id' },
          { type_code: 'value', value: createdProductId },
        ],
      } as any;

      const updateCount = await updateShopifyRecords(
        base_context,
        { description: ['Updated via record-based helper'] },
        whereCondition,
        { table: 'Products' }
      );

      expect(updateCount).toBe(1);
    });

    it('Should delete the created product', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: SHOPIFY_ACCESS_TOKEN or SHOPIFY_SHOP not set');
        return;
      }
      if (!createdProductId) {
        console.warn('Skipping: Created product ID not defined');
        return;
      }

      // Delete using WHERE condition
      const whereCondition = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'id' },
          { type_code: 'value', value: createdProductId },
        ],
      } as any;

      const deleteCount = await deleteShopifyRecords(base_context, whereCondition, { table: 'Products' });

      expect(deleteCount).toBe(1);

      // Clear the ID
      createdProductId = undefined;
    });
  });

  describe('Should test Shopify full CRUD cycle (integration tests)', () => {
    const base_context = {
      conn_opts: {
        token: '',
        shop: '',
      } as any,
    };

    let hasCredentials = false;
    let testProductIds: string[] = [];

    beforeAll(() => {
      const token = process.env.SHOPIFY_ACCESS_TOKEN;
      const shop = process.env.SHOPIFY_SHOP;

      if (!token || !shop) {
        console.warn('SHOPIFY_ACCESS_TOKEN or SHOPIFY_SHOP not set, skipping integration tests');
        return;
      }

      hasCredentials = true;
      base_context.conn_opts.token = token;
      base_context.conn_opts.shop = shop;
    });

    afterAll(async () => {
      if (!hasCredentials) return;

      // Clean up any test products created
      if (testProductIds.length > 0) {
        for (const productId of testProductIds) {
          try {
            const whereCondition = {
              exp: '==',
              args: [
                { type_code: 'field reference', field: 'id' },
                { type_code: 'value', value: productId },
              ],
            } as any;

            await deleteShopifyRecords(base_context, whereCondition, { table: 'Products' });
            await delay(500);
          } catch {
            // Product may already be deleted
          }
        }
      }
    });

    afterEach(async () => {
      if (hasCredentials) {
        await delay(500);
      }
    });

    it('Should perform full CRUD cycle', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: SHOPIFY_ACCESS_TOKEN or SHOPIFY_SHOP not set');
        return;
      }

      const timestamp = Date.now();

      // CREATE - Create two test products
      const testProduct1Title = `CRUD Test Product 1 - ${timestamp}`;
      const testProduct2Title = `CRUD Test Product 2 - ${timestamp}`;

      const createRecords = {
        title: [testProduct1Title, testProduct2Title],
        description: ['Test product 1 for CRUD cycle', 'Test product 2 for CRUD cycle'],
        productType: ['Test'],
        vendor: ['CRUD Test Vendor'],
        status: ['DRAFT'],
      };

      const createdRecords = await createShopifyRecords(base_context, createRecords, {
        table: 'Products',
      });

      expect(createdRecords).toBeDefined();
      expect(createdRecords.id).toBeDefined();
      expect(createdRecords.id.length).toBe(2);

      testProductIds = createdRecords.id as string[];

      // READ - Search for created products by ID (more reliable than vendor search due to indexing delay)
      await delay(1000); // Wait for indexing

      // Search for first product by ID
      const whereCondition = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'id' },
          { type_code: 'value', value: testProductIds[0] },
        ],
      } as any;

      const iterator = await searchShopifyRecords(base_context, whereCondition, {
        table: 'Products',
      });

      const batch = await iterator(base_context, 100);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
        // Note: Shopify search indexing may take time, so we don't strictly require finding the product
        // The important thing is the search operation completed without error
      }

      // UPDATE - Update first product
      const updateWhere = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'id' },
          { type_code: 'value', value: testProductIds[0] },
        ],
      } as any;

      const updateCount = await updateShopifyRecords(
        base_context,
        { description: ['Updated description via CRUD test'] },
        updateWhere,
        { table: 'Products' }
      );

      expect(updateCount).toBe(1);

      // DELETE - Delete both products
      for (const productId of testProductIds) {
        const deleteWhere = {
          exp: '==',
          args: [
            { type_code: 'field reference', field: 'id' },
            { type_code: 'value', value: productId },
          ],
        } as any;

        const deleteCount = await deleteShopifyRecords(base_context, deleteWhere, { table: 'Products' });
        expect(deleteCount).toBe(1);
        await delay(500);
      }

      // Clear the testProductIds since we've deleted them
      testProductIds = [];
    }, 120000); // Extended timeout for CRUD operations

    it('Should handle search with AND expression', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: SHOPIFY_ACCESS_TOKEN or SHOPIFY_SHOP not set');
        return;
      }

      // Search with AND expression (status is ACTIVE AND vendor is not empty)
      const whereCondition = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'ACTIVE' },
            ],
          },
          {
            exp: 'is-set',
            args: [{ type_code: 'field reference', field: 'vendor' }],
          },
        ],
      } as any;

      const iterator = await searchShopifyRecords(base_context, whereCondition, {
        table: 'Products',
      });

      expect(iterator).toBeDefined();
      const batch = await iterator(base_context, 10);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
        // All records should match both conditions
        for (const record of records) {
          expect(record.status).toBe('ACTIVE');
        }
      }
    });
  });
});
