import { IQoreAllowedValue, TQoreAppActionFunctionContext } from '@qoretechnologies/ts-toolkit';
import { ClientResponse, createAdminApiClient } from '@shopify/admin-api-client';
import { SHOPIFY_CONN_OPTIONS } from '../constants';

export interface TShopifyClient {
  request: (
    query: string,
    options?: { variables?: Record<string, any> }
  ) => Promise<ClientResponse<any>>;
  session: {
    shop: string;
    token: string;
  };
}

export class ShopifyError extends Error {
  constructor(
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ShopifyError';
  }
}

export const createShopifyClient = (
  context: TQoreAppActionFunctionContext<typeof SHOPIFY_CONN_OPTIONS> | undefined
): TShopifyClient => {
  const { token, shop } = context?.conn_opts || {};

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');
  if (!shop) missingValues.push('shop');

  if (missingValues.length) {
    throw new ShopifyError(`Missing required connection options: ${missingValues.join(', ')}`);
  }

  try {
    const shopDomain = `${shop}.myshopify.com`;

    const adminClient = createAdminApiClient({
      apiVersion: '2025-04',
      accessToken: token as string,
      storeDomain: shopDomain,
    });

    const client: TShopifyClient = {
      request: (query: string, options?: { variables?: Record<string, any> }) => {
        return adminClient.request(query, options);
      },
      session: {
        shop: shop as string,
        token: token as string,
      },
    };

    return client;
  } catch (error) {
    throw new ShopifyError('Failed to initialize Shopify client', error);
  }
};

export const executeShopifyGraphQL = async (
  context: TQoreAppActionFunctionContext<typeof SHOPIFY_CONN_OPTIONS> | undefined,
  query: string,
  variables: Record<string, any> = {}
): Promise<ClientResponse<any>> => {
  try {
    const client = createShopifyClient(context);

    const response = await client.request(query, {
      variables,
    });

    if (response.errors) {
      let errorMessage = 'GraphQL errors';

      if (Array.isArray(response.errors)) {
        errorMessage = response.errors.map((err) => err.message).join('; ');
      } else if (typeof response.errors === 'object') {
        errorMessage = Object.values(response.errors)
          .map((err) => (typeof err === 'string' ? err : JSON.stringify(err)))
          .join('; ');
      }

      throw new ShopifyError(`GraphQL errors: ${errorMessage}`);
    }

    return response;
  } catch (error) {
    if (error instanceof ShopifyError) {
      throw error;
    }
    throw new ShopifyError(`GraphQL query failed: ${error.message}`, error);
  }
};

export const extractShopifyCustomerTags = (data: any): string[] => {
  const uniqueTags = new Set<string>();
  const shopEdges = data?.shop?.customerTags?.edges;
  const customerEdges = data?.customers?.edges;

  if (shopEdges) {
    shopEdges?.forEach((edge: any) => {
      if (edge.node) {
        uniqueTags.add(edge.node);
      }
    });
  } else if (customerEdges) {
    customerEdges.forEach((edge: any) => {
      if (edge.node?.tags) {
        const tagsList = edge.node.tags;
        tagsList.forEach((tag: string) => {
          if (tag) uniqueTags.add(tag);
        });
      }
    });
  }

  return Array.from(uniqueTags).sort();
};

export interface IShopifyAllowedValuesOptions<TNodeType, TAllowedValue> {
  queryBuilder: (after: string | null) => string;
  dataExtractor: (data: any) => Array<{ node: TNodeType }>;
  pageInfoExtractor: (data: any) => { hasNextPage: boolean; endCursor: string | null };
  mapper: (node: TNodeType) => IQoreAllowedValue<TAllowedValue>;
  errorMessage: string;
}

export const getShopifyAllowedValues = async <TNodeType, TAllowedValue>(
  context: TQoreAppActionFunctionContext<typeof SHOPIFY_CONN_OPTIONS> | undefined,
  options: IShopifyAllowedValuesOptions<TNodeType, TAllowedValue>
): Promise<IQoreAllowedValue<TAllowedValue>[]> => {
  const { queryBuilder, dataExtractor, pageInfoExtractor, mapper, errorMessage } = options;

  try {
    const allowedValues: IQoreAllowedValue<TAllowedValue>[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      const query = queryBuilder(cursor);

      const response = await executeShopifyGraphQL(context, query);

      const edges = dataExtractor(response.data);
      const pageInfo = pageInfoExtractor(response.data);

      const values = edges.map((edge) => mapper(edge.node));
      allowedValues.push(...values);

      if (!pageInfo.endCursor) {
        break;
      }

      hasNextPage = pageInfo.hasNextPage;
      cursor = pageInfo.endCursor;
    }

    return allowedValues;
  } catch (error) {
    if (error instanceof ShopifyError) {
      throw error;
    }
    throw new ShopifyError(errorMessage + `: ${error.message}`, error);
  }
};

export const extractShopifyNumericId = (globalId: string, resourceType?: string): string => {
  const regex = resourceType ? new RegExp(`\\/${resourceType}\\/(\\d+)$`) : /\/(\d+)$/;

  const match = globalId.match(regex);

  return match ? match[1] : globalId;
};

export const extractShopifyNodes = (data: Record<string, any>): Record<string, any> => {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(extractShopifyNodes);
  }

  if (data.edges && Array.isArray(data.edges)) {
    return data.edges
      .map((edge) => extractShopifyNodes(edge.node))
      .filter((node) => node !== null && node !== undefined);
  }

  if (typeof data === 'object') {
    const transformedObj: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (key === 'id' && typeof value === 'string') {
        transformedObj[key] = extractShopifyNumericId(value);
      } else {
        transformedObj[key] = extractShopifyNodes(value);
      }
    }

    return transformedObj;
  }

  return data;
};

export const transformShopifyResponse = (response: Record<string, any>) => {
  if (response.data) {
    const operationKey = Object.keys(response.data)[0];
    const operationData = response.data[operationKey];

    if (operationData?.nodes && Array.isArray(operationData.nodes)) {
      return operationData.nodes.map((node: any) => extractShopifyNodes(node));
    }

    if (operationData?.edges && Array.isArray(operationData.edges)) {
      return extractShopifyNodes(operationData);
    }

    return {
      ...operationData,
      ...Object.fromEntries(
        Object.entries(operationData)
          .filter(([, value]) => typeof value === 'object')
          .map(([key, value]) => [key, extractShopifyNodes(value as Record<string, any>)])
      ),
    };
  }

  return extractShopifyNodes(response);
};
