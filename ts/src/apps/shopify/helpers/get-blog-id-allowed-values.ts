import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_CONN_OPTIONS } from '../constants';
import { extractShopifyNumericId, getShopifyAllowedValues } from './constants';

interface IBlogNode {
  id: string;
  title: string;
  handle: string;
  articlesCount?: {
    count: number;
  };
}

export const getShopifyBlogIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SHOPIFY_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  return await getShopifyAllowedValues<IBlogNode, string>(context, {
    queryBuilder: (after: string | null) => {
      return `
        query {
          blogs(first: 100${after ? `, after: "${after}"` : ''}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                title
                handle
                articlesCount {
                  count
                }
              }
            }
          }
        }
      `;
    },

    dataExtractor: (data) => data.blogs.edges || [],

    pageInfoExtractor: (data) => data.blogs.pageInfo,

    mapper: (blog) => {
      const numericId = extractShopifyNumericId(blog.id, 'Blog');

      return {
        display_name: blog.title || 'Unnamed Blog',
        value: numericId,
        desc: `Handle: ${blog.handle || 'No handle'}\n\nArticles: ${blog.articlesCount?.count || 0}`,
      };
    },

    errorMessage: 'Failed to fetch Shopify blogs',
  });
};

export const getShopifyBlogTitleAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SHOPIFY_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  return await getShopifyAllowedValues<IBlogNode, string>(context, {
    queryBuilder: (after: string | null) => {
      return `
        query {
          blogs(first: 100${after ? `, after: "${after}"` : ''}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                title
                handle
                articlesCount {
                  count
                }
              }
            }
          }
        }
      `;
    },

    dataExtractor: (data) => data.blogs.edges || [],

    pageInfoExtractor: (data) => data.blogs.pageInfo,

    mapper: (blog) => {
      return {
        display_name: blog.title || 'Unnamed Blog',
        value: blog.handle || blog.title,
        desc: `Handle: ${blog.handle || 'No handle'}\n\nArticles: ${blog.articlesCount?.count || 0}`,
      };
    },

    errorMessage: 'Failed to fetch Shopify blogs',
  });
};
