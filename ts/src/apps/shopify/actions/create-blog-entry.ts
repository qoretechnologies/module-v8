import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import {
  executeShopifyGraphQL,
  ShopifyError,
  transformShopifyResponse,
} from '../helpers/constants';
import { getShopifyBlogIdAllowedValues } from '../helpers/get-blog-id-allowed-values';
import { ShopifyAddBlogEntryResponseType } from './response-types/create-blog-entry.response';

const options = {
  blogId: {
    type: 'string',
    required: true,
    get_allowed_values: getShopifyBlogIdAllowedValues,
  },
  title: {
    type: 'string',
    required: true,
  },
  content: {
    type: 'string',
    required: true,
  },
  author: {
    type: 'string',
    required: true,
  },
  tags: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
  summary: {
    type: 'string',
    required: false,
  },
  published: {
    type: 'bool',
    required: false,
    default_value: true,
  },
  image: {
    type: {
      type: 'hash',
      fields: {
        altText: {
          type: 'string',
          required: true,
        },
        url: {
          type: 'string',
          required: true,
        },
      },
    },
    required: false,
  },
} satisfies TQoreOptions;

const CreateShopifyBlogEntry = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'create-blog-entry',
  app: SHOPIFY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const { blogId, title, content, author, tags, summary, image } = data || {};
    const published = data?.published !== false;

    const missingValues: string[] = [];
    if (!blogId) missingValues.push('blogId');
    if (!title) missingValues.push('title');
    if (!content) missingValues.push('content');
    if (!author) missingValues.push('author');

    if (missingValues.length) {
      throw new ShopifyError(`Missing required fields: ${missingValues.join(', ')}`);
    }

    try {
      const createMutation = `
        mutation CreateArticle($article: ArticleCreateInput!) {
          articleCreate(article: $article) {
            article {
              id
              title
              author {
                name
              }
              handle
              body
              tags
              image {
                altText
                url
              }
              summary
              isPublished
              createdAt
              updatedAt
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        article: {
          blogId: `gid://shopify/Blog/${blogId}`,
          title,
          body: content,
          isPublished: published,
          author: { name: author },
          ...(tags ? { tags } : {}),
          ...(summary ? { summary } : {}),
          ...(image ? { image } : {}),
        },
      } satisfies Record<string, any>;

      const result = await executeShopifyGraphQL(
        context as TShopifyContextWithConn,
        createMutation,
        variables
      );

      const userErrors = result.data?.articleCreate?.userErrors || [];
      if (userErrors.length > 0) {
        const errors = userErrors.map((err: { message: string }) => err.message).join('; ');
        throw new ShopifyError(`Failed to create blog article: ${errors}`);
      }

      return transformShopifyResponse(result.data.articleCreate);
    } catch (error) {
      if (error instanceof ShopifyError) {
        throw error;
      }
      throw new ShopifyError(`Failed to create Shopify blog article: ${error.message}`, error);
    }
  },
  options,
  response_type: ShopifyAddBlogEntryResponseType,
});

export default CreateShopifyBlogEntry;
