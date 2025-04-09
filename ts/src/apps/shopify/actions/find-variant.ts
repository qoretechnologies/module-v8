import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import {
  executeShopifyGraphQL,
  ShopifyError,
  transformShopifyResponse,
} from '../helpers/constants';
import { getShopifyProductVariantIdAllowedValues } from '../helpers/get-product-variant-id-allowed-values';
import { getShopifyProductIdAllowedValues } from '../helpers/get-shopify-product-id-allowed-values';
import { ShopifyFindVariantResponseType } from './response-types/find-variant.response';

const options = {
  productId: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    get_allowed_values: getShopifyProductIdAllowedValues,
  },
  title: {
    type: 'string',
    required: false,
  },
  sku: {
    type: 'string',
    required: false,
  },
  barcode: {
    type: 'string',
    required: false,
  },
  id: {
    type: 'string',
    required: false,
    get_allowed_values: getShopifyProductVariantIdAllowedValues,
    allowed_values_creatable: true,
  },

  inventoryQuantity: {
    type: 'string',
    required: false,
  },
  productStatus: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'ACTIVE', display_name: 'Active' },
      { value: 'DRAFT', display_name: 'Draft' },
      { value: 'ARCHIVED', display_name: 'Archived' },
    ],
  },
  productType: {
    type: 'string',
    required: false,
  },
  tag: {
    type: 'string',
    required: false,
  },
  tagNot: {
    type: 'string',
    required: false,
  },
  vendor: {
    type: 'string',
    required: false,
  },
  collection: {
    type: 'string',
    required: false,
  },
  option1: {
    type: 'string',
    required: false,
  },
  option2: {
    type: 'string',
    required: false,
  },
  option3: {
    type: 'string',
    required: false,
  },
  taxable: {
    type: 'boolean',
    required: false,
    allowed_values: [
      { value: true, display_name: 'Taxable' },
      { value: false, display_name: 'Non-taxable' },
    ],
  },
  updatedAt: {
    type: 'string',
    required: false,
  },

  rawQuery: {
    type: 'string',
    required: false,
  },
  sortKey: {
    type: 'string',
    required: false,
    default_value: 'POSITION',
    allowed_values: [
      { value: 'POSITION', display_name: 'Position' },
      { value: 'TITLE', display_name: 'Title' },
      { value: 'SKU', display_name: 'SKU' },
      { value: 'ID', display_name: 'ID' },
      { value: 'INVENTORY_QUANTITY', display_name: 'Inventory Quantity' },
      { value: 'CREATED_AT', display_name: 'Created At' },
      { value: 'UPDATED_AT', display_name: 'Updated At' },
    ],
  },
  reverse: {
    type: 'boolean',
    required: false,
    default_value: false,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 20,
  },
  cursor: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

type TFindVariantInput = {
  productId?: string;
  title?: string;
  sku?: string;
  barcode?: string;
  id?: string;
  inventoryQuantity?: string;
  productStatus?: string;
  productType?: string;
  tag?: string;
  tagNot?: string;
  vendor?: string;
  collection?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  taxable?: boolean;
  updatedAt?: string;
  sortKey?: string;
  reverse?: boolean;
  rawQuery?: string;
  limit?: number;
  cursor?: string;
};

const findVariants = async (context: TShopifyContextWithConn, data: TFindVariantInput) => {
  const limit = Math.min(data?.limit || 20, 250);
  const sortKey = data?.sortKey || 'POSITION';
  const reverse = data?.reverse !== undefined ? data.reverse : false;

  return await findAllVariants(context, data, limit, sortKey, reverse);
};

const findAllVariants = async (
  context: TShopifyContextWithConn,
  data: TFindVariantInput,
  limit: number,
  sortKey: string,
  reverse: boolean
) => {
  let cursorParam = '';
  if (data?.cursor) {
    cursorParam = `, after: "${data.cursor}"`;
  }

  let queryStr = '';

  if (data?.rawQuery) {
    queryStr = data.rawQuery;
  } else {
    const queryParts = [];

    if (data?.title) queryParts.push(`title:${data.title}`);
    if (data?.sku) queryParts.push(`sku:${data.sku}`);
    if (data?.barcode) queryParts.push(`barcode:${data.barcode}`);
    if (data?.id) queryParts.push(`id:${data.id}`);
    if (data?.productId) queryParts.push(`product_id:${data.productId}`);
    if (data?.inventoryQuantity) queryParts.push(`inventory_quantity:${data.inventoryQuantity}`);
    if (data?.productStatus) queryParts.push(`product_status:${data.productStatus}`);
    if (data?.productType) queryParts.push(`product_type:${data.productType}`);
    if (data?.tag) queryParts.push(`tag:${data.tag}`);
    if (data?.tagNot) queryParts.push(`tag_not:${data.tagNot}`);
    if (data?.vendor) queryParts.push(`vendor:${data.vendor}`);
    if (data?.collection) queryParts.push(`collection:${data.collection}`);
    if (data?.option1) queryParts.push(`option1:${data.option1}`);
    if (data?.option2) queryParts.push(`option2:${data.option2}`);
    if (data?.option3) queryParts.push(`option3:${data.option3}`);
    if (data?.taxable !== undefined) queryParts.push(`taxable:${data.taxable}`);
    if (data?.updatedAt) queryParts.push(`updated_at:${data.updatedAt}`);

    queryStr = queryParts.join(' AND ');
  }

  const productVariantsQuery = `
    query {
      productVariants(
        first: ${limit},
        sortKey: ${sortKey},
        reverse: ${reverse}
        ${cursorParam}
        ${queryStr ? `query: "${queryStr}"` : ''}
      ) {
        edges {
          node {
            id
            title
            displayName
            sku
            barcode
            price
            compareAtPrice
            inventoryQuantity
            sellableOnlineQuantity
            availableForSale
            position
            requiresComponents
            taxable
            taxCode
            createdAt
            updatedAt
            inventoryPolicy
            product {
              id
              title
            }
            image {
              id
              url
              altText
              width
              height
            }
            selectedOptions {
              name
              value
            }
            metafields(first: 10) {
              edges {
                node {
                  namespace
                  key
                  value
                  type
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const result = await executeShopifyGraphQL(context, productVariantsQuery, {});

  if (result.errors) {
    const errorMessage = result.errors.message;
    throw new ShopifyError(`Failed to find product variants: ${errorMessage}`);
  }

  return {
    variants: result.data.productVariants,
    pageInfo: result.data.productVariants.pageInfo,
  };
};

export const FindShopifyVariant = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'find-variant',
  app: SHOPIFY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    try {
      const result = await findVariants(
        context as TShopifyContextWithConn,
        data as TFindVariantInput
      );

      return {
        variants: transformShopifyResponse(result.variants),
        pageInfo: result.pageInfo,
      };
    } catch (error) {
      if (error instanceof ShopifyError) {
        throw error;
      }
      throw new ShopifyError(`Failed to find Shopify variants: ${error.message}`, error);
    }
  },
  options,
  response_type: ShopifyFindVariantResponseType,
});
