import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import {
  executeShopifyGraphQL,
  ShopifyError,
  transformShopifyResponse,
} from '../helpers/constants';
import { ShopifyFindProductResponseType } from './response-types/find-product.response';
import { getShopifyProductIdAllowedValues } from '../helpers/get-shopify-product-id-allowed-values';

const options = {
  titleQuery: {
    type: 'string',
    required: false,
  },
  vendorQuery: {
    type: 'string',
    required: false,
  },
  productTypeQuery: {
    type: 'string',
    required: false,
  },
  tagQuery: {
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
  productIdQuery: {
    type: 'string',
    required: false,
    get_allowed_values: getShopifyProductIdAllowedValues,
    allowed_values_creatable: true,
  },
  collectionIdQuery: {
    type: 'string',
    required: false,
  },
  sortKey: {
    type: 'string',
    required: false,
    default_value: 'TITLE',
    allowed_values_creatable: true,
    allowed_values: [
      {
        value: 'TITLE',
        display_name: 'Title',
      },
      {
        value: 'PRODUCT_TYPE',
        display_name: 'Product Type',
      },
      {
        value: 'VENDOR',
        display_name: 'Vendor',
      },
      {
        value: 'UPDATED_AT',
        display_name: 'Updated At',
      },
      {
        value: 'CREATED_AT',
        display_name: 'Created At',
      },
      {
        value: 'BEST_SELLING',
        display_name: 'Best Selling',
      },
      {
        value: 'PRICE',
        display_name: 'Price',
      },
      {
        value: 'ID',
        display_name: 'ID',
      },
      {
        value: 'INVENTORY_TOTAL',
        display_name: 'Inventory Total',
      },
    ],
  },
  reverse: {
    type: 'bool',
    required: false,
    default_value: false,
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

type TFindProductInput = {
  titleQuery?: string;
  vendorQuery?: string;
  productTypeQuery?: string;
  tagQuery?: string;
  skuQuery?: string;
  barcodeQuery?: string;
  productIdQuery?: string;
  collectionIdQuery?: string;
  sortKey?: string;
  reverse?: boolean;
  rawQuery?: string;
  limit?: number;
  cursor?: string;
};

const findProducts = async (context: TShopifyContextWithConn, data: TFindProductInput) => {
  const limit = Math.min(data?.limit || 20, 250);
  const sortKey = data?.sortKey || 'TITLE';
  const reverse = data?.reverse !== undefined ? data.reverse : false;

  let queryStr = '';

  if (data?.rawQuery) {
    queryStr = data.rawQuery;
  } else {
    const queryParts = [];

    if (data?.titleQuery) queryParts.push(`title:${data.titleQuery}`);
    if (data?.vendorQuery) queryParts.push(`vendor:${data.vendorQuery}`);
    if (data?.productTypeQuery) queryParts.push(`product_type:${data.productTypeQuery}`);
    if (data?.tagQuery) queryParts.push(`tag:${data.tagQuery}`);
    if (data?.skuQuery) queryParts.push(`sku:${data.skuQuery}`);
    if (data?.barcodeQuery) queryParts.push(`barcode:${data.barcodeQuery}`);
    if (data?.productIdQuery) queryParts.push(`id:${data.productIdQuery}`);
    if (data?.collectionIdQuery) queryParts.push(`collection_id:${data.collectionIdQuery}`);

    queryStr = queryParts.join(' AND ');
  }

  let cursorParam = '';
  if (data?.cursor) {
    cursorParam = `, after: "${data.cursor}"`;
  }

  const findProductsQuery = `
    query {
      products(
        first: ${limit}, 
        sortKey: ${sortKey}, 
        reverse: ${reverse}
        ${cursorParam}
        ${queryStr ? `, query: "${queryStr}"` : ''}) {
        edges {
          node {
            id
            title
            handle
            description
            descriptionHtml
            productType
            vendor
            tags
            status
            isGiftCard
            requiresSellingPlan
            tracksInventory
            hasOnlyDefaultVariant
            hasOutOfStockVariants
            createdAt
            updatedAt
            publishedAt
            onlineStoreUrl
            onlineStorePreviewUrl
            templateSuffix
            legacyResourceId
            featuredMedia {
              ... on MediaImage {
                id
                image {
                  url
                  altText
                  width
                  height
                }
              }
            }
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
            totalInventory
            seo {
              title
              description
            }
            options {
              id
              name
              values
              position
            }
            media(first: 10) {
              edges {
                node {
                  ... on MediaImage {
                    id
                    image {
                      url
                      altText
                      width
                      height
                    }
                  }
                  ... on Video {
                    id
                    sources {
                      url
                      mimeType
                      format
                      height
                      width
                    }
                    originalSource {
                      url
                      mimeType
                      format
                      height
                      width
                    }
                  }
                  ... on Model3d {
                    id
                    sources {
                      url
                      mimeType
                      format
                    }
                    originalSource {
                      url
                      mimeType
                      format
                    }
                  }
                }
              }
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

  const productsResult = await executeShopifyGraphQL(context, findProductsQuery, {});

  if (productsResult.errors) {
    const errorMessage = productsResult.errors.message;
    throw new ShopifyError(`Failed to find products: ${errorMessage}`);
  }

  return {
    products: productsResult.data.products,
    pageInfo: productsResult.data.products.pageInfo,
  };
};

const FindShopifyProduct = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'find-product',
  app: SHOPIFY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    try {
      const { products, pageInfo } = await findProducts(
        context as TShopifyContextWithConn,
        data as TFindProductInput
      );

      const productsTransformed = transformShopifyResponse(products);

      return {
        products: productsTransformed,
        pageInfo,
      };
    } catch (error) {
      if (error instanceof ShopifyError) {
        throw error;
      }
      throw new ShopifyError(`Failed to find Shopify products: ${error.message}`, error);
    }
  },
  options,
  response_type: ShopifyFindProductResponseType,
});

export default FindShopifyProduct;
