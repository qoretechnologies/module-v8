/**
 * Shopify Search Options
 *
 * Defines the sorting and ordering options available for product searches.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';

/**
 * Search options for Shopify products
 */
export const ShopifySearchOptions: TQoreCrudOptions = {
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          desc: 'Field to sort by',
          allowed_values: [
            { value: 'TITLE', display_name: 'Title' },
            { value: 'PRODUCT_TYPE', display_name: 'Product Type' },
            { value: 'VENDOR', display_name: 'Vendor' },
            { value: 'UPDATED_AT', display_name: 'Updated At' },
            { value: 'CREATED_AT', display_name: 'Created At' },
            { value: 'BEST_SELLING', display_name: 'Best Selling' },
            { value: 'INVENTORY_TOTAL', display_name: 'Inventory Total' },
            { value: 'ID', display_name: 'ID' },
          ],
        },
        direction: {
          type: 'string',
          desc: 'Sort direction',
          default_value: 'asc',
          allowed_values: [
            { value: 'asc', display_name: 'Ascending' },
            { value: 'desc', display_name: 'Descending' },
          ],
        },
      },
    },
  },
};
