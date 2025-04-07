import { EQoreAppActionCode, QoreAppCreator, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import { executeShopifyGraphQL, transformShopifyResponse } from '../helpers/constants';

const triggerName = 'shopify-abandoned-cart-trigger';

const shopifyAbandonedCheckoutType = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
      desc: 'The ID of the abandoned checkout',
    },
    completedAt: {
      type: 'string',
      desc: 'The date and time when the checkout was completed',
    },
    createdAt: {
      type: 'string',
      desc: 'The date and time when the checkout was created',
    },
    updatedAt: {
      type: 'string',
      desc: 'The date and time when the checkout was last modified',
    },
    customAttributes: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            key: {
              type: 'string',
              desc: 'The key of the custom attribute',
            },
            value: {
              type: 'string',
              desc: 'The value of the custom attribute',
            },
          },
        },
      },
    },
    abandonedCheckoutUrl: {
      type: 'string',
      desc: 'The URL for the checkout',
    },
    customer: {
      type: {
        type: 'hash',
        fields: {
          id: {
            type: 'string',
            desc: 'The ID of the customer',
          },
          email: {
            type: 'string',
            desc: 'The email address of the customer',
          },
          firstName: {
            type: 'string',
            desc: 'The first name of the customer',
          },
          lastName: {
            type: 'string',
            desc: 'The last name of the customer',
          },
          tags: {
            type: 'string',
            desc: 'Tags associated with the customer',
          },
          note: {
            type: 'string',
            desc: 'Notes associated with the customer',
          },
        },
      },
    },
    name: {
      type: 'string',
      desc: 'The name of the abandoned checkout',
    },
    note: {
      type: 'string',
      desc: 'Notes associated with the abandoned checkout',
    },
    totalPriceSet: {
      type: {
        type: 'hash',
        fields: {
          presentmentMoney: {
            type: {
              type: 'hash',
              fields: {
                amount: {
                  type: 'string',
                  desc: 'The amount of money in the presentment currency',
                },
                currencyCode: {
                  type: 'string',
                  desc: 'The currency code for the presentment money',
                },
              },
            },
          },
          shopMoney: {
            type: {
              type: 'hash',
              fields: {
                amount: {
                  type: 'string',
                  desc: 'The amount of money in the shop currency',
                },
                currencyCode: {
                  type: 'string',
                  desc: 'The currency code for the shop money',
                },
              },
            },
          },
        },
      },
    },
    lineItems: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: {
              type: 'string',
            },
            title: {
              type: 'string',
            },
            quantity: {
              type: 'int',
            },
            variant: {
              type: {
                type: 'hash',
                fields: {
                  id: {
                    type: 'string',
                  },
                  title: {
                    type: 'string',
                  },
                  price: {
                    type: 'string',
                  },
                  sku: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies TQoreTypeObject;

const shopifyAbandonedCheckoutTrigger = QoreAppCreator.createLocalizedTrigger({
  app: SHOPIFY_APP_NAME,
  action: triggerName,
  action_code: EQoreAppActionCode.EVENT,
  options: {
    abandonedHours: {
      type: 'integer',
      desc: 'The number of hours to look back for abandoned carts',
      default_value: 24,
      required: true,
    },
  },
  event_function: async (context, update, should_stop) => {
    if (!context.conn_opts?.token || !context.conn_opts?.shop) {
      throw new Error(
        `The shop and token are required to start the Shopify ${triggerName} trigger`
      );
    }

    const abandonedHours = context.opts?.abandonedHours || 24;

    await pollCreatedItemsForTrigger({
      trigger_name: triggerName,
      uniqueField: 'id',
      getItems: () => getAbandonedCheckouts(context as TShopifyContextWithConn, abandonedHours),
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

    const abandonedHours = context.opts?.abandonedHours || 24;
    const checkouts = await getAbandonedCheckouts(
      context as TShopifyContextWithConn,
      abandonedHours
    );

    return checkouts?.length > 0 ? checkouts[0] : null;
  },
  event_info: {
    desc: 'Triggers when a Shopify cart is abandoned for a specified number of hours',
    type: shopifyAbandonedCheckoutType,
  },
});

const getAbandonedCheckouts = async (context: TShopifyContextWithConn, abandonedHours = 24) => {
  const hoursAgo = new Date();
  hoursAgo.setHours(hoursAgo.getHours() - abandonedHours);
  const isoDate = hoursAgo.toISOString();

  const query = `
    query {
      abandonedCheckouts(first: ${DEFAULT_TRIGGER_POLL_ITEM_LIMIT}, query: "created_at:>='${isoDate}'") {
        edges {
          node {
            id
            abandonedCheckoutUrl
            completedAt
            createdAt
            updatedAt
            customAttributes {
              key
              value
            }
            customer {
              id
              email
              firstName
              lastName
              tags
              note
            }
            lineItems(first: 10) {
              edges {
                node {
                  id
                  title
                  quantity
                }
              }
            }
            name
            note
            totalPriceSet {
              presentmentMoney {
                amount
                currencyCode
              }
              shopMoney {
                amount
                currencyCode
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

  const variables = {};

  try {
    const response = await executeShopifyGraphQL(context, query, variables);
    const transformedResponse = transformShopifyResponse(response);

    return transformedResponse || [];
  } catch (error) {
    throw new Error(`Failed to fetch abandoned checkouts: ${error.message}`);
  }
};

export default shopifyAbandonedCheckoutTrigger;
