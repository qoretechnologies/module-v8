/**
 * Shopify Get Table List
 *
 * Returns all available record types (tables) in Shopify.
 * Currently supports Products.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_RECORD_TYPES } from './constants';

/**
 * Get all available tables (record types) in Shopify.
 * Currently returns: ["Products"]
 */
export const getShopifyTableList: TQoreGetTableListFunction = async () => {
  // Return available record types
  // No API call needed as these are static
  return [...SHOPIFY_RECORD_TYPES];
};
