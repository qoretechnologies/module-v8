/**
 * Shopify Create Records
 *
 * Creates new Shopify products (records).
 * Products are created sequentially as Shopify doesn't support batch creation.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { executeShopifyGraphQL } from '../constants';
import {
  PRODUCT_FIELDS_FRAGMENT,
  ShopifyRecordError,
  transformProductToRecord,
  transformRecordToProductInput,
  TShopifyProduct,
  TShopifyRecordType,
} from './constants';

/**
 * Create new products in Shopify.
 * Accepts records in column format and returns created records in column format.
 */
export const createShopifyRecords: TQoreCreateRecordsFunction = async (ctx, records, opts) => {
  getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'shop'] as const,
    ErrorClass: ShopifyRecordError,
  });

  const tableName = opts?.table as TShopifyRecordType | undefined;

  if (!tableName) {
    throw new ShopifyRecordError('Table name is required in opts.table');
  }

  if (tableName !== 'Products') {
    throw new ShopifyRecordError(`Unknown table: ${tableName}. Available tables: Products`);
  }

  try {
    // Convert column format to array of records
    const recordsArray = mapColumnFormatToObject(records);
    const createdRecords: Record<string, unknown>[] = [];

    // Create products sequentially (Shopify doesn't support batch create)
    for (const record of recordsArray) {
      const { productInput, metafieldInputs } = transformRecordToProductInput(record);

      // Ensure title is present
      if (!productInput.title) {
        throw new ShopifyRecordError('Product title is required');
      }

      // Add metafields to product input if present
      if (metafieldInputs.length > 0) {
        productInput.metafields = metafieldInputs.map((mf) => ({
          namespace: mf.namespace,
          key: mf.key,
          value: mf.value,
          type: mf.type,
        }));
      }

      // Create the product using GraphQL mutation
      const createMutation = `
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              ${PRODUCT_FIELDS_FRAGMENT}
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const response = await executeShopifyGraphQL(
        ctx as Parameters<typeof executeShopifyGraphQL>[0],
        createMutation,
        { input: productInput }
      );

      const result = response.data?.productCreate;

      if (result?.userErrors?.length > 0) {
        const errorMessages = result.userErrors.map((e: { field: string[]; message: string }) =>
          `${e.field?.join('.')}: ${e.message}`
        ).join('; ');
        throw new ShopifyRecordError(`Failed to create product: ${errorMessages}`);
      }

      if (result?.product) {
        createdRecords.push(transformProductToRecord(result.product as TShopifyProduct));
      }
    }

    return mapObjectToColumnFormat(createdRecords);
  } catch (error) {
    if (error instanceof ShopifyRecordError) {
      throw error;
    }

    throw new ShopifyRecordError(`Failed to create records: ${error}`);
  }
};
