import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import {
  executeShopifyGraphQL,
  ShopifyError,
  transformShopifyResponse,
} from '../helpers/constants';
import { ShopifyFindVariantResponseType } from './response-types/find-variant.response';

const options = {
  productId: {
    type: 'string',
    required: false,
  },
  titleQuery: {
    type: 'string',
    required: false,
  },
  skuQuery: {
    type: 'string',
    required: false,
  },
  barcodeQuery: {
    type: 'string',
    required: false,
  },
  variantIdQuery: {
    type: 'string',
    required: false,
  },
  inventoryQuery: {
    type: 'string',
    required: false,
  },
  priceQuery: {
    type: 'string',
    required: false,
  },
  rawQuery: {
    type: 'string',
    required: false,
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
  titleQuery?: string;
  skuQuery?: string;
  barcodeQuery?: string;
  variantIdQuery?: string;
  inventoryQuery?: string;
  priceQuery?: string;
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

  if (data?.productId) {
    return await findVariantsByProduct(context, data, limit, sortKey, reverse);
  }

  return await findAllVariants(context, data, limit, sortKey, reverse);
};

const findVariantsByProduct = async (
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

  let variantsFilterStr = '';
  if (data?.rawQuery) {
    variantsFilterStr = `, query: "${data.rawQuery}"`;
  } else {
    const filterParts = [];

    if (data?.titleQuery) filterParts.push(`title:${data.titleQuery}`);
    if (data?.skuQuery) filterParts.push(`sku:${data.skuQuery}`);
    if (data?.barcodeQuery) filterParts.push(`barcode:${data.barcodeQuery}`);
    if (data?.variantIdQuery) filterParts.push(`id:${data.variantIdQuery}`);
    if (data?.inventoryQuery) filterParts.push(`inventory_status:${data.inventoryQuery}`);
    if (data?.priceQuery) filterParts.push(`price:${data.priceQuery}`);

    if (filterParts.length > 0) {
      variantsFilterStr = `, query: "${filterParts.join(' AND ')}"`;
    }
  }

  const productVariantsQuery = `
    query {
      product(id: "${data.productId}") {
        id
        title
        variants(
          first: ${limit}, 
          sortKey: ${sortKey}, 
          reverse: ${reverse}
          ${cursorParam}
          ${variantsFilterStr}
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
              weight
              weightUnit
              createdAt
              updatedAt
              inventoryPolicy
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
    }
  `;

  const result = await executeShopifyGraphQL(context, productVariantsQuery, {});

  if (result.errors) {
    const errorMessage = result.errors.message;
    throw new ShopifyError(`Failed to find product variants: ${errorMessage}`);
  }

  if (!result.data.product) {
    throw new ShopifyError(`Product not found with ID: ${data.productId}`);
  }

  return {
    productId: result.data.product.id,
    productTitle: result.data.product.title,
    variants: result.data.product.variants,
    pageInfo: result.data.product.variants.pageInfo,
  };
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

    if (data?.titleQuery) queryParts.push(`variant_title:${data.titleQuery}`);
    if (data?.skuQuery) queryParts.push(`sku:${data.skuQuery}`);
    if (data?.barcodeQuery) queryParts.push(`barcode:${data.barcodeQuery}`);
    if (data?.variantIdQuery) queryParts.push(`variant_id:${data.variantIdQuery}`);
    if (data?.inventoryQuery) queryParts.push(`inventory_status:${data.inventoryQuery}`);
    if (data?.priceQuery) queryParts.push(`variant_price:${data.priceQuery}`);

    queryStr = queryParts.join(' AND ');
  }

  const productsWithVariantsQuery = `
    query {
      products(
        first: 50,
        ${queryStr ? `query: "${queryStr}"` : ''}
      ) {
        edges {
          node {
            id
            title
            variants(
              first: ${limit}, 
              sortKey: ${sortKey}, 
              reverse: ${reverse}
              ${cursorParam}
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
        }
      }
    }
  `;

  const result = await executeShopifyGraphQL(context, productsWithVariantsQuery, {});

  if (result.errors) {
    const errorMessage = result.errors.message;
    throw new ShopifyError(`Failed to find product variants: ${errorMessage}`);
  }

  const allVariants = {
    edges: [] as Array<Record<string, unknown>>,
    pageInfo: {
      hasNextPage: false,
      endCursor: null,
    },
  };

  if (result.data.products.edges.length > 0) {
    for (const productEdge of result.data.products.edges) {
      const product = productEdge.node;

      const variantsWithProduct = product.variants.edges.map((edge: { node: any }) => ({
        node: {
          ...edge.node,
          product: {
            id: product.id,
            title: product.title,
          },
        },
      }));

      allVariants.edges.push(...variantsWithProduct);

      if (product.variants.pageInfo.hasNextPage) {
        allVariants.pageInfo.hasNextPage = true;
        allVariants.pageInfo.endCursor = product.variants.pageInfo.endCursor;
      }
    }
  }

  allVariants.edges = allVariants.edges.slice(0, limit);

  return {
    variants: allVariants,
    pageInfo: allVariants.pageInfo,
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

      if ('productId' in result) {
        return {
          productId: result.productId,
          productTitle: result.productTitle,
          variants: transformShopifyResponse(result.variants),
          pageInfo: result.pageInfo,
        };
      } else {
        return {
          variants: transformShopifyResponse(result.variants),
          pageInfo: result.pageInfo,
        };
      }
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
