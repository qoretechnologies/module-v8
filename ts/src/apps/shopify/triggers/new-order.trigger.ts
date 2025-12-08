import { EQoreAppActionCode, QoreAppCreator, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import { executeShopifyGraphQL, transformShopifyResponse } from '../helpers/constants';

const triggerName = 'shopify-new-order-trigger';

export enum EShopifyOrderStatus {
  ANY = 'ANY',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  FULFILLED = 'FULFILLED',
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  AUTHORIZED = 'AUTHORIZED',
  PENDING = 'PENDING',
}

export const shopifyOrderStatusOptions = {
  [EShopifyOrderStatus.ANY]: {
    value: EShopifyOrderStatus.ANY,
    display_name: 'Any Status',
  },
  [EShopifyOrderStatus.OPEN]: {
    value: EShopifyOrderStatus.OPEN,
    display_name: 'Open',
  },
  [EShopifyOrderStatus.CLOSED]: {
    value: EShopifyOrderStatus.CLOSED,
    display_name: 'Closed',
  },
  [EShopifyOrderStatus.CANCELLED]: {
    value: EShopifyOrderStatus.CANCELLED,
    display_name: 'Cancelled',
  },
  [EShopifyOrderStatus.FULFILLED]: {
    value: EShopifyOrderStatus.FULFILLED,
    display_name: 'Fulfilled',
  },
  [EShopifyOrderStatus.PAID]: {
    value: EShopifyOrderStatus.PAID,
    display_name: 'Paid',
  },
  [EShopifyOrderStatus.UNPAID]: {
    value: EShopifyOrderStatus.UNPAID,
    display_name: 'Unpaid',
  },
  [EShopifyOrderStatus.AUTHORIZED]: {
    value: EShopifyOrderStatus.AUTHORIZED,
    display_name: 'Authorized',
  },
  [EShopifyOrderStatus.PENDING]: {
    value: EShopifyOrderStatus.PENDING,
    display_name: 'Pending',
  },
};

const shopifyOrderType = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
      desc: 'A globally-unique ID',
    },
    name: {
      type: 'string',
      desc: 'The unique identifier for the order',
    },
    email: {
      type: 'string',
      desc: 'The email address associated with the customer',
    },
    phone: {
      type: 'string',
      desc: 'The phone number associated with the customer',
    },
    createdAt: {
      type: 'string',
      desc: 'Date and time when the order was created in Shopify',
    },
    updatedAt: {
      type: 'string',
      desc: 'The date and time when the order was modified last',
    },
    processedAt: {
      type: 'string',
      desc: 'The date and time when the order was processed',
    },
    cancelledAt: {
      type: 'string',
      desc: 'The date and time when the order was canceled',
    },
    cancelReason: {
      type: 'string',
      desc: 'The reason provided when the order was canceled',
    },
    closed: {
      type: 'bool',
      desc: 'Whether the order is closed',
    },
    closedAt: {
      type: 'string',
      desc: 'The date and time when the order was closed',
    },
    confirmed: {
      type: 'bool',
      desc: 'Whether inventory has been reserved for the order',
    },
    currencyCode: {
      type: 'string',
      desc: 'The shop currency when the order was placed',
    },
    fullyPaid: {
      type: 'bool',
      desc: 'Whether the order has been paid in full',
    },
    unpaid: {
      type: 'bool',
      desc: 'Whether no payments have been made for the order',
    },
    fulfillable: {
      type: 'bool',
      desc: 'Whether there are line items that can be fulfilled',
    },
    note: {
      type: 'string',
      desc: 'The contents of the note associated with the order',
    },
    tags: {
      type: {
        type: 'list',
        desc: 'A comma separated list of tags associated with the order',
        element_type: {
          type: 'string',
        },
      },
    },
    taxesIncluded: {
      type: 'bool',
      desc: 'Whether taxes are included in the subtotal price of the order',
    },
    taxExempt: {
      type: 'bool',
      desc: 'Whether taxes are exempt on the order',
    },
    test: {
      type: 'bool',
      desc: 'Whether the order is a test',
    },
    totalPrice: {
      type: 'string',
      desc: 'The total price of the order',
    },
    subtotalPrice: {
      type: 'string',
      desc: 'The sum of the prices for all line items',
    },
    totalDiscounts: {
      type: 'string',
      desc: 'The total amount discounted on the order',
    },
    totalShippingPrice: {
      type: 'string',
      desc: 'The total shipping amount',
    },
    totalTax: {
      type: 'string',
      desc: 'The total tax amount',
    },
    financialStatus: {
      type: 'string',
      desc: 'The financial status of the order',
    },
    fulfillmentStatus: {
      type: 'string',
      desc: 'The fulfillment status for the order',
    },
    customer: {
      type: {
        type: 'hash',
        desc: 'The customer that placed the order',
        fields: {
          id: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
          firstName: {
            type: 'string',
          },
          lastName: {
            type: 'string',
          },
          phone: {
            type: 'string',
          },
        },
      },
    },
    shippingAddress: {
      type: {
        type: 'hash',
        desc: 'The mailing address of the customer',
        fields: {
          address1: {
            type: 'string',
          },
          address2: {
            type: 'string',
          },
          city: {
            type: 'string',
          },
          company: {
            type: 'string',
          },
          country: {
            type: 'string',
          },
          firstName: {
            type: 'string',
          },
          lastName: {
            type: 'string',
          },
          phone: {
            type: 'string',
          },
          province: {
            type: 'string',
          },
          zip: {
            type: 'string',
          },
        },
      },
    },
    billingAddress: {
      type: {
        type: 'hash',
        desc: 'The billing address of the customer',
        fields: {
          address1: {
            type: 'string',
          },
          address2: {
            type: 'string',
          },
          city: {
            type: 'string',
          },
          company: {
            type: 'string',
          },
          country: {
            type: 'string',
          },
          firstName: {
            type: 'string',
          },
          lastName: {
            type: 'string',
          },
          phone: {
            type: 'string',
          },
          province: {
            type: 'string',
          },
          zip: {
            type: 'string',
          },
        },
      },
    },
    lineItems: {
      type: {
        type: 'list',
        desc: "A list of the order's line items",
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
            price: {
              type: 'string',
            },
            sku: {
              type: 'string',
            },
            variantTitle: {
              type: 'string',
            },
            totalDiscount: {
              type: 'string',
            },
          },
        },
      },
    },
  },
} satisfies TQoreTypeObject;

const shopifyNewOrderTrigger = QoreAppCreator.createLocalizedTrigger({
  app: SHOPIFY_APP_NAME,
  action: triggerName,
  action_code: EQoreAppActionCode.EVENT,
  options: {
    orderStatus: {
      type: 'string',
      desc: 'The status of orders to monitor',
      allowed_values: Object.values(shopifyOrderStatusOptions),
      default_value: EShopifyOrderStatus.ANY,
      required: true,
    },
  },
  event_function: async (context, update, should_stop) => {
    if (!context.conn_opts?.token || !context.conn_opts?.shop) {
      throw new Error(
        `The shop and token are required to start the Shopify ${triggerName} trigger`
      );
    }

    const orderStatus = context.opts?.orderStatus || EShopifyOrderStatus.ANY;

    await pollCreatedItemsForTrigger({
      trigger_name: triggerName,
      uniqueField: 'id',
      getItems: () =>
        getRecentOrders(context as TShopifyContextWithConn, orderStatus as EShopifyOrderStatus),
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

    const orderStatus = context.opts?.orderStatus || EShopifyOrderStatus.ANY;
    const orders = await getRecentOrders(
      context as TShopifyContextWithConn,
      orderStatus as EShopifyOrderStatus
    );

    return orders?.length > 0 ? orders[0] : null;
  },
  event_info: {
    desc: 'Triggers when a new Shopify order matches the specified status',
    type: shopifyOrderType,
  },
});

const getRecentOrders = async (
  context: TShopifyContextWithConn,
  orderStatus = EShopifyOrderStatus.ANY
) => {
  let queryFilter = '';

  switch (orderStatus) {
    case EShopifyOrderStatus.OPEN:
      queryFilter = 'status:OPEN';
      break;
    case EShopifyOrderStatus.CLOSED:
      queryFilter = 'status:CLOSED';
      break;
    case EShopifyOrderStatus.CANCELLED:
      queryFilter = 'status:CANCELLED';
      break;
    case EShopifyOrderStatus.FULFILLED:
      queryFilter = 'fulfillment_status:FULFILLED';
      break;
    case EShopifyOrderStatus.PAID:
      queryFilter = 'financial_status:PAID';
      break;
    case EShopifyOrderStatus.UNPAID:
      queryFilter = 'financial_status:UNPAID';
      break;
    case EShopifyOrderStatus.AUTHORIZED:
      queryFilter = 'financial_status:AUTHORIZED';
      break;
    case EShopifyOrderStatus.PENDING:
      queryFilter = 'financial_status:PENDING';
      break;
    default:
      queryFilter = '';

      const query = `
    query {
      orders(
        first: ${DEFAULT_TRIGGER_POLL_ITEM_LIMIT}, 
        sortKey: UPDATED_AT, 
        reverse: true${
          queryFilter
            ? `, 
        query: "${queryFilter}"`
            : ''
        }) {
        edges {
          node {
            id
            name
            email
            phone
            createdAt
            updatedAt
            processedAt
            cancelledAt
            cancelReason
            closed
            closedAt
            confirmed
            currencyCode
            fullyPaid
            unpaid
            fulfillable
            note
            tags
            taxesIncluded
            taxExempt
            test
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            subtotalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            totalDiscountsSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            totalShippingPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            totalTaxSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            displayFinancialStatus
            displayFulfillmentStatus
            customer {
              id
              email
              firstName
              lastName
              phone
            }
            shippingAddress {
              address1
              address2
              city
              company
              country
              firstName
              lastName
              phone
              province
              zip
            }
            billingAddress {
              address1
              address2
              city
              company
              country
              firstName
              lastName
              phone
              province
              zip
            }
            lineItems(first: 20) {
              edges {
                node {
                  id
                  title
                  quantity
                  originalUnitPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                  sku
                  variantTitle
                  totalDiscountSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
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

      try {
        const response = await executeShopifyGraphQL(context, query);
        const transformedResponse = transformShopifyResponse(response);

        const orders = transformedResponse || [];

        return orders.map(
          (order: {
            totalPriceSet: { shopMoney: { amount: string } };
            subtotalPriceSet: { shopMoney: { amount: string } };
            totalDiscountsSet: { shopMoney: { amount: string } };
            totalShippingPriceSet: { shopMoney: { amount: string } };
            totalTaxSet: { shopMoney: { amount: string } };
            lineItems: {
              map: (
                arg0: (item: any) => {
                  id: any;
                  title: any;
                  quantity: any;
                  price: any;
                  sku: any;
                  variantTitle: any;
                  totalDiscount: any;
                }
              ) => never[];
            };
            displayFinancialStatus: any;
            displayFulfillmentStatus: any;
          }) => {
            const totalPrice = order.totalPriceSet?.shopMoney?.amount || '0';
            const subtotalPrice = order.subtotalPriceSet?.shopMoney?.amount || '0';
            const totalDiscounts = order.totalDiscountsSet?.shopMoney?.amount || '0';
            const totalShippingPrice = order.totalShippingPriceSet?.shopMoney?.amount || '0';
            const totalTax = order.totalTaxSet?.shopMoney?.amount || '0';

            const lineItems =
              order.lineItems?.map((item) => ({
                id: item.id,
                title: item.title,
                quantity: item.quantity,
                price: item.originalUnitPriceSet?.shopMoney?.amount || '0',
                sku: item.sku,
                variantTitle: item.variantTitle,
                totalDiscount: item.totalDiscountSet?.shopMoney?.amount || '0',
              })) || [];

            return {
              ...order,
              totalPrice,
              subtotalPrice,
              totalDiscounts,
              totalShippingPrice,
              totalTax,
              financialStatus: order.displayFinancialStatus,
              fulfillmentStatus: order.displayFulfillmentStatus,
              lineItems,
            };
          }
        );
      } catch (error) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }
  }
};
export default shopifyNewOrderTrigger;
