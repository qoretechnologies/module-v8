/**
 * Shopify Record-Based Helpers Constants
 *
 * This module provides utilities for working with Shopify's product data
 * in a record-based context where Products are treated as "tables"
 * and individual Products with their fields are "records".
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreType } from '@qoretechnologies/ts-toolkit';

/**
 * Custom error class for Shopify record-based operations
 */
export class ShopifyRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShopifyRecordError';
  }
}

/**
 * Metafield prefix for distinguishing metafields from standard fields
 */
export const METAFIELD_PREFIX = 'mf_';

/**
 * Maximum page size for Shopify GraphQL queries
 */
export const MAX_PAGE_SIZE = 250;

/**
 * Available record types (tables) in Shopify
 */
export const SHOPIFY_RECORD_TYPES = ['Products'] as const;

export type TShopifyRecordType = (typeof SHOPIFY_RECORD_TYPES)[number];

/**
 * Standard product fields type definition
 */
export const STANDARD_PRODUCT_FIELDS: Record<string, TQoreType> = {
  id: 'string',
  title: 'string',
  handle: 'string',
  description: 'string',
  descriptionHtml: 'string',
  productType: 'string',
  vendor: 'string',
  tags: { type: 'list', element_type: 'string' },
  status: 'string',
  createdAt: 'date',
  updatedAt: 'date',
  publishedAt: 'date',
  totalInventory: 'integer',
  tracksInventory: 'bool',
  hasOnlyDefaultVariant: 'bool',
  hasOutOfStockVariants: 'bool',
  isGiftCard: 'bool',
  requiresSellingPlan: 'bool',
  onlineStoreUrl: 'string',
  templateSuffix: 'string',
  // Price range
  minPrice: 'number',
  maxPrice: 'number',
  currencyCode: 'string',
  // SEO
  seoTitle: 'string',
  seoDescription: 'string',
  // Featured image
  featuredImageUrl: 'string',
  featuredImageAltText: 'string',
};

/**
 * Shopify product from GraphQL API
 */
export interface TShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  vendor: string;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  totalInventory: number;
  tracksInventory: boolean;
  hasOnlyDefaultVariant: boolean;
  hasOutOfStockVariants: boolean;
  isGiftCard: boolean;
  requiresSellingPlan: boolean;
  onlineStoreUrl: string | null;
  templateSuffix: string | null;
  priceRangeV2?: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  seo?: {
    title: string | null;
    description: string | null;
  };
  featuredMedia?: {
    image?: {
      url: string;
      altText: string | null;
    };
  } | null;
  metafields?: {
    edges: Array<{
      node: {
        namespace: string;
        key: string;
        value: string;
        type: string;
      };
    }>;
  };
}

/**
 * Extract numeric ID from Shopify global ID
 */
export const extractNumericId = (globalId: string): string => {
  const match = globalId.match(/\/(\d+)$/);
  return match ? match[1] : globalId;
};

/**
 * Build Shopify global ID from numeric ID
 */
export const buildGlobalId = (numericId: string, resourceType: string = 'Product'): string => {
  if (numericId.startsWith('gid://')) {
    return numericId;
  }
  return `gid://shopify/${resourceType}/${numericId}`;
};

/**
 * Transform a Shopify product to a flat record format
 */
export const transformProductToRecord = (product: TShopifyProduct): Record<string, unknown> => {
  const record: Record<string, unknown> = {
    id: extractNumericId(product.id),
    title: product.title,
    handle: product.handle,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    productType: product.productType,
    vendor: product.vendor,
    tags: product.tags,
    status: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    publishedAt: product.publishedAt,
    totalInventory: product.totalInventory,
    tracksInventory: product.tracksInventory,
    hasOnlyDefaultVariant: product.hasOnlyDefaultVariant,
    hasOutOfStockVariants: product.hasOutOfStockVariants,
    isGiftCard: product.isGiftCard,
    requiresSellingPlan: product.requiresSellingPlan,
    onlineStoreUrl: product.onlineStoreUrl,
    templateSuffix: product.templateSuffix,
    // Price range
    minPrice: product.priceRangeV2?.minVariantPrice
      ? parseFloat(product.priceRangeV2.minVariantPrice.amount)
      : null,
    maxPrice: product.priceRangeV2?.maxVariantPrice
      ? parseFloat(product.priceRangeV2.maxVariantPrice.amount)
      : null,
    currencyCode: product.priceRangeV2?.minVariantPrice?.currencyCode || null,
    // SEO
    seoTitle: product.seo?.title || null,
    seoDescription: product.seo?.description || null,
    // Featured image
    featuredImageUrl: product.featuredMedia?.image?.url || null,
    featuredImageAltText: product.featuredMedia?.image?.altText || null,
  };

  // Flatten metafields with mf_ prefix
  if (product.metafields?.edges) {
    for (const edge of product.metafields.edges) {
      const { namespace, key, value, type } = edge.node;
      const fieldKey = `${METAFIELD_PREFIX}${namespace}_${key}`;

      // Parse value based on type
      switch (type) {
        case 'number_integer':
          record[fieldKey] = parseInt(value, 10);
          break;
        case 'number_decimal':
          record[fieldKey] = parseFloat(value);
          break;
        case 'boolean':
          record[fieldKey] = value === 'true';
          break;
        case 'json':
          try {
            record[fieldKey] = JSON.parse(value);
          } catch {
            record[fieldKey] = value;
          }
          break;
        default:
          record[fieldKey] = value;
      }
    }
  }

  return record;
};

/**
 * Transform a flat record to Shopify product input (for create/update)
 */
export const transformRecordToProductInput = (
  record: Record<string, unknown>
): { productInput: Record<string, unknown>; metafieldInputs: Array<{ namespace: string; key: string; value: string; type: string }> } => {
  const productInput: Record<string, unknown> = {};
  const metafieldInputs: Array<{ namespace: string; key: string; value: string; type: string }> = [];

  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith(METAFIELD_PREFIX)) {
      // Metafield
      const fieldName = key.slice(METAFIELD_PREFIX.length);
      const separatorIndex = fieldName.indexOf('_');
      if (separatorIndex > 0) {
        const namespace = fieldName.slice(0, separatorIndex);
        const metaKey = fieldName.slice(separatorIndex + 1);

        let type = 'single_line_text_field';
        let stringValue = String(value);

        if (typeof value === 'number') {
          type = Number.isInteger(value) ? 'number_integer' : 'number_decimal';
          stringValue = String(value);
        } else if (typeof value === 'boolean') {
          type = 'boolean';
          stringValue = String(value);
        } else if (typeof value === 'object') {
          type = 'json';
          stringValue = JSON.stringify(value);
        }

        metafieldInputs.push({ namespace, key: metaKey, value: stringValue, type });
      }
    } else if (key !== 'id' && STANDARD_PRODUCT_FIELDS[key]) {
      // Standard field - map to product input
      switch (key) {
        case 'title':
        case 'handle':
        case 'productType':
        case 'vendor':
        case 'status':
        case 'templateSuffix':
          productInput[key] = value;
          break;
        case 'description':
          productInput.descriptionHtml = value;
          break;
        case 'tags':
          productInput.tags = value;
          break;
        case 'seoTitle':
          productInput.seo = {
            ...(typeof productInput.seo === 'object' && productInput.seo !== null ? productInput.seo : {}),
            title: value,
          };
          break;
        case 'seoDescription':
          productInput.seo = {
            ...(typeof productInput.seo === 'object' && productInput.seo !== null ? productInput.seo : {}),
            description: value,
          };
          break;
        // Read-only fields - skip
        case 'createdAt':
        case 'updatedAt':
        case 'publishedAt':
        case 'totalInventory':
        case 'tracksInventory':
        case 'hasOnlyDefaultVariant':
        case 'hasOutOfStockVariants':
        case 'isGiftCard':
        case 'requiresSellingPlan':
        case 'onlineStoreUrl':
        case 'minPrice':
        case 'maxPrice':
        case 'currencyCode':
        case 'featuredImageUrl':
        case 'featuredImageAltText':
        case 'descriptionHtml':
          // Skip read-only fields
          break;
      }
    }
  }

  return { productInput, metafieldInputs };
};

/**
 * Normalize set values to single record (for update operations)
 */
export const normalizeSetToSingleRecord = (
  set: Record<string, unknown[] | unknown>
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(set)) {
    if (Array.isArray(value)) {
      result[key] = value[0];
    } else {
      result[key] = value;
    }
  }

  return result;
};

/**
 * GraphQL fragments for product queries
 */
export const PRODUCT_FIELDS_FRAGMENT = `
  id
  title
  handle
  description
  descriptionHtml
  productType
  vendor
  tags
  status
  createdAt
  updatedAt
  publishedAt
  totalInventory
  tracksInventory
  hasOnlyDefaultVariant
  hasOutOfStockVariants
  isGiftCard
  requiresSellingPlan
  onlineStoreUrl
  templateSuffix
  priceRangeV2 {
    minVariantPrice {
      amount
      currencyCode
    }
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  seo {
    title
    description
  }
  featuredMedia {
    ... on MediaImage {
      image {
        url
        altText
      }
    }
  }
  metafields(first: 20) {
    edges {
      node {
        namespace
        key
        value
        type
      }
    }
  }
`;
