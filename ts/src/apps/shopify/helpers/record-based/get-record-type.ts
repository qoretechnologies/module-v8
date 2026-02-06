/**
 * Shopify Get Record Type
 *
 * Returns the schema for a specific record type (table).
 * Currently supports Products.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetRecordTypeFunction, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { ShopifyRecordError, STANDARD_PRODUCT_FIELDS, TShopifyRecordType } from './constants';

/**
 * Get the record type (schema) for a specific table.
 * Returns field definitions with types.
 */
export const getShopifyRecordType: TQoreGetRecordTypeFunction = async (_ctx, tablePath) => {
  const tableName = tablePath as TShopifyRecordType | undefined;

  if (!tableName) {
    throw new ShopifyRecordError('Table name is required');
  }

  if (tableName === 'Products') {
    return getProductRecordType();
  }

  throw new ShopifyRecordError(`Unknown table: ${tableName}. Available tables: Products`);
};

/**
 * Get the record type for Products
 */
const getProductRecordType = (): TQoreTypeObject => {
  const fields: Record<string, { type: any; desc?: string; required?: boolean }> = {};

  for (const [fieldName, fieldType] of Object.entries(STANDARD_PRODUCT_FIELDS)) {
    fields[fieldName] = {
      type: fieldType,
      desc: getFieldDescription(fieldName),
      required: fieldName === 'title',
    };
  }

  return {
    type: 'hash',
    fields,
  };
};

/**
 * Get description for a product field
 */
const getFieldDescription = (fieldName: string): string => {
  const descriptions: Record<string, string> = {
    id: 'Unique product identifier',
    title: 'Product title (required)',
    handle: 'URL-friendly product handle',
    description: 'Plain text product description',
    descriptionHtml: 'HTML product description',
    productType: 'Product type/category',
    vendor: 'Product vendor/manufacturer',
    tags: 'Product tags for organization',
    status: 'Product status (ACTIVE, ARCHIVED, DRAFT)',
    createdAt: 'Date and time when the product was created',
    updatedAt: 'Date and time when the product was last updated',
    publishedAt: 'Date and time when the product was published',
    totalInventory: 'Total inventory quantity across all variants',
    tracksInventory: 'Whether inventory is tracked for this product',
    hasOnlyDefaultVariant: 'Whether the product has only a default variant',
    hasOutOfStockVariants: 'Whether any variants are out of stock',
    isGiftCard: 'Whether this product is a gift card',
    requiresSellingPlan: 'Whether a selling plan is required for purchase',
    onlineStoreUrl: 'URL of the product on the online store',
    templateSuffix: 'Theme template suffix for the product',
    minPrice: 'Minimum variant price',
    maxPrice: 'Maximum variant price',
    currencyCode: 'Currency code for prices',
    seoTitle: 'SEO title for the product',
    seoDescription: 'SEO description for the product',
    featuredImageUrl: 'URL of the featured product image',
    featuredImageAltText: 'Alt text for the featured image',
  };

  return descriptions[fieldName] || fieldName;
};
