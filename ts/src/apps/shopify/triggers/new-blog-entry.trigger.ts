import { EQoreAppActionCode, QoreAppCreator, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import { executeShopifyGraphQL, transformShopifyResponse } from '../helpers/constants';
import { getShopifyBlogIdAllowedValues } from '../helpers/get-blog-id-allowed-values';

const triggerName = 'shopify-blog-entry-trigger';

const shopifyBlogEntryType = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
      desc: 'The ID of the blog entry',
    },
    title: {
      type: 'string',
      desc: 'The title of the blog entry',
    },
    handle: {
      type: 'string',
      desc: 'The handle of the blog entry',
    },
    body: {
      type: 'string',
      desc: "The text of the article's body, complete with HTML markup",
    },
    summary: {
      type: 'string',
      desc: 'A summary of the article, which can include HTML markup',
    },
    publishedAt: {
      type: 'string',
      desc: 'The date and time when the article became or will become visible',
    },
    isPublished: {
      type: 'boolean',
      desc: 'Whether or not the article is visible',
    },
    createdAt: {
      type: 'string',
      desc: 'The date and time when the article was created',
    },
    updatedAt: {
      type: 'string',
      desc: 'The date and time when the article was last updated',
    },
    templateSuffix: {
      type: 'string',
      desc: "The name of the template an article is using if it's using an alternate template",
    },
    blog: {
      type: {
        type: 'hash',
        fields: {
          id: {
            type: 'string',
            desc: 'The ID of the parent blog',
          },
          title: {
            type: 'string',
            desc: 'The title of the parent blog',
          },
        },
      },
    },
    author: {
      type: {
        type: 'hash',
        fields: {
          name: {
            type: 'string',
            desc: 'The name of the author',
          },
        },
      },
    },
    tags: {
      type: {
        type: 'list',
        element_type: {
          type: 'string',
        },
      },
      desc: 'A comma-separated list of tags',
    },
    image: {
      type: {
        type: 'hash',
        fields: {
          id: {
            type: 'string',
            desc: 'The ID of the image',
          },
          url: {
            type: 'string',
            desc: 'The URL of the image',
          },
          altText: {
            type: 'string',
            desc: 'The alt text of the image',
          },
        },
      },
    },
  },
} satisfies TQoreTypeObject;

const shopifyBlogEntryTrigger = QoreAppCreator.createLocalizedTrigger({
  app: SHOPIFY_APP_NAME,
  action: triggerName,
  action_code: EQoreAppActionCode.EVENT,
  options: {
    blogId: {
      type: 'string',
      desc: 'The ID of the blog to filter entries by (can be a GraphQL ID or regular ID)',
      allowed_values_creatable: true,
      get_allowed_values: getShopifyBlogIdAllowedValues,
      required: true,
    },
    entryStatus: {
      type: 'string',
      desc: 'The status of blog entries to fetch',
      allowed_values: [
        { value: 'ANY', desc: 'Any status' },
        { value: 'PUBLISHED', desc: 'Published entries' },
        { value: 'DRAFT', desc: 'Draft entries' },
        { value: 'ARCHIVED', desc: 'Archived entries' },
      ],
      default_value: 'PUBLISHED',
      required: true,
    },
  },
  event_function: async (context, update, should_stop) => {
    if (!context.conn_opts?.token || !context.conn_opts?.shop || !context.opts?.blogId) {
      throw new Error(
        `The shop, blogId and token are required to start the Shopify ${triggerName} trigger`
      );
    }

    const blogId = context.opts?.blogId || null;
    const entryStatus = context.opts?.entryStatus || 'PUBLISHED';

    await pollCreatedItemsForTrigger({
      trigger_name: triggerName,
      uniqueField: 'id',
      getItems: () => getBlogEntries(context as TShopifyContextWithConn, blogId, entryStatus),
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    if (!context.conn_opts?.token || !context.conn_opts?.shop) {
      throw new Error(
        `The shop and token are required to get the example event data for the Shopify ${triggerName}`
      );
    }

    const blogId = context.opts?.blogId || null;
    const entryStatus = context.opts?.entryStatus || 'PUBLISHED';

    const blogEntries = await getBlogEntries(
      context as TShopifyContextWithConn,
      blogId,
      entryStatus
    );

    return blogEntries?.length > 0 ? blogEntries[0] : null;
  },
  event_info: {
    desc: 'Triggers when a Shopify blog entry is created or updated',
    type: shopifyBlogEntryType,
  },
});

const getBlogEntries = async (
  context: TShopifyContextWithConn,
  blogId: string | null = null,
  entryStatus: string = 'PUBLISHED'
) => {
  let blogFilter = '';
  if (blogId) {
    if (blogId.startsWith('gid://')) {
      blogFilter = `, blog: "${blogId}"`;
    } else {
      const formattedBlogId = `gid://shopify/OnlineStoreBlog/${blogId}`;
      blogFilter = `, blog: "${formattedBlogId}"`;
    }
  }

  let statusFilter = '';
  if (entryStatus && entryStatus !== 'ANY') {
    statusFilter = `, query: "status:${entryStatus.toLowerCase()}"`;
  }

  const query = `
    query BlogEntryList {
      articles(first: ${DEFAULT_TRIGGER_POLL_ITEM_LIMIT}${blogFilter}${statusFilter}) {
        nodes {
          id
          handle
          title
          body
          summary
          publishedAt
          isPublished
          createdAt
          updatedAt
          templateSuffix
          blog {
            id
            title
          }
          author {
            name
          }
          tags
          image {
            id
            url
            altText
          }
        }
      }
    }
  `;

  const variables = {};

  try {
    const response = await executeShopifyGraphQL(context, query, variables);
    const transformedResponse = transformShopifyResponse(response);

    return transformedResponse || [];
  } catch (error) {
    throw new Error(`Failed to fetch blog entries: ${error.message}`);
  }
};

export default shopifyBlogEntryTrigger;
