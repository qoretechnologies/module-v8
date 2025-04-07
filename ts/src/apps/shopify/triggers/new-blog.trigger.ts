import { EQoreAppActionCode, QoreAppCreator, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import { executeShopifyGraphQL, transformShopifyResponse } from '../helpers/constants';

const triggerName = 'shopify-blog-trigger';

const shopifyBlogType = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
      desc: 'The ID of the blog',
    },
    title: {
      type: 'string',
      desc: 'The title of the blog',
    },
    handle: {
      type: 'string',
      desc: 'The handle of the blog',
    },
    createdAt: {
      type: 'string',
      desc: 'The date and time when the blog was created',
    },
    updatedAt: {
      type: 'string',
      desc: 'The date and time when the blog was last updated',
    },
    commentPolicy: {
      type: 'string',
      desc: 'The comment policy for the blog',
    },
    templateSuffix: {
      type: 'string',
      desc: 'The template suffix for the blog',
    },
    tags: {
      type: {
        type: 'list',
        element_type: {
          type: 'string',
        },
      },
      desc: 'Tags associated with the blog',
    },
    feed: {
      type: {
        type: 'hash',
        fields: {
          path: {
            type: 'string',
            desc: 'The path of the blog feed',
          },
          location: {
            type: 'string',
            desc: 'The location of the blog feed',
          },
        },
      },
    },
  },
} satisfies TQoreTypeObject;

const shopifyBlogTrigger = QoreAppCreator.createLocalizedTrigger({
  app: SHOPIFY_APP_NAME,
  action: triggerName,
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    if (!context.conn_opts?.token || !context.conn_opts?.shop) {
      throw new Error(
        `The shop and token are required to start the Shopify ${triggerName} trigger`
      );
    }

    await pollCreatedItemsForTrigger({
      trigger_name: triggerName,
      uniqueField: 'id',
      getItems: () => getBlogs(context as TShopifyContextWithConn),
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

    const blogs = await getBlogs(context as TShopifyContextWithConn);

    return blogs?.length > 0 ? blogs[0] : null;
  },
  event_info: {
    desc: 'Triggers when a Shopify blog is created or updated within a specified timeframe',
    type: shopifyBlogType,
  },
});

const getBlogs = async (context: TShopifyContextWithConn) => {
  const query = `
    query BlogList {
      blogs(first: ${DEFAULT_TRIGGER_POLL_ITEM_LIMIT}) {
        nodes {
          id
          handle
          title
          updatedAt
          commentPolicy
          feed {
            path
            location
          }
          createdAt
          templateSuffix
          tags
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
    throw new Error(`Failed to fetch blogs: ${error.message}`);
  }
};

export default shopifyBlogTrigger;
