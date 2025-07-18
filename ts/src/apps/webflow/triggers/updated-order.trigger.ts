import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { WEBFLOW_APP_NAME, WebflowError } from '../constants';
import { createWebflowClient } from '../helpers/constants';
import { getWebflowSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';

const trigger = 'updated_order';

const options = {
  site: {
    type: 'string',
    required: true,
    get_allowed_values: getWebflowSiteIdAllowedValues,
  },
} satisfies TQoreOptions;

const WebflowUpdatedOrder = QoreAppCreator.createLocalizedTrigger<typeof options>({
  action: trigger,
  app: WEBFLOW_APP_NAME,
  action_code: EQoreAppActionCode.EVENT,
  webhook_event_loc: 'payload',
  webhook_method: 'POST',
  options,
  webhook_register: async (context, url) => {
    const { token, site } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['site'],
      ErrorClass: WebflowError,
    });

    const client = createWebflowClient(token);

    const webhook = await client.webhooks.create(site, {
      url,
      triggerType: 'ecomm_order_changed',
    });

    return { webhook };
  },
  webhook_deregister: async (context, _url, regInfo) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: WebflowError,
    });

    const webhookId = regInfo.webhook.id;

    if (!webhookId) {
      throw new WebflowError('Webhook ID is required for deregistration.');
    }

    const client = createWebflowClient(token);

    await client.webhooks.delete(webhookId);
  },
  get_example_event_data: async (context) => {
    const { token, site } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['site'],
      ErrorClass: WebflowError,
    });

    const client = createWebflowClient(token);

    const ordersResponse = await client.orders.list(site, { limit: 1 });
    const orderId = ordersResponse.orders?.[0]?.orderId;

    if (!orderId) return null;

    const order = await client.orders.get(site, orderId);

    if (!order) return null;

    return order;
  },
  event_info: {
    desc: 'Order updated event data',
    type: {
      type: 'hash',
      fields: {
        status: { type: 'string' },
        comment: { type: 'string' },
        orderComment: { type: 'string' },
        acceptedOn: { type: 'string' },
        fulfilledOn: { type: 'string' },
        refundedOn: { type: 'string' },
        disputedOn: { type: 'string' },
        disputeUpdatedOn: { type: 'string' },
        disputeLastStatus: { type: 'string' },
        customerPaid: {
          type: {
            type: 'hash',
            fields: {
              unit: { type: 'string' },
              value: { type: 'string' },
              string: { type: 'string' },
            },
          },
        },
        netAmount: {
          type: {
            type: 'hash',
            fields: {
              unit: { type: 'string' },
              value: { type: 'string' },
              string: { type: 'string' },
            },
          },
        },
        applicationFee: {
          type: {
            type: 'hash',
            fields: {
              unit: { type: 'string' },
              value: { type: 'string' },
              string: { type: 'string' },
            },
          },
        },
        allAddresses: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                type: { type: 'string' },
                addressee: { type: 'string' },
                line1: { type: 'string' },
                line2: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                country: { type: 'string' },
                postalCode: { type: 'string' },
              },
            },
          },
        },
        shippingAddress: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              japanType: { type: 'string' },
              addressee: { type: 'string' },
              line1: { type: 'string' },
              line2: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              country: { type: 'string' },
              postalCode: { type: 'string' },
            },
          },
        },
        billingAddress: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              addressee: { type: 'string' },
              line1: { type: 'string' },
              line2: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              country: { type: 'string' },
              postalCode: { type: 'string' },
            },
          },
        },
        shippingProvider: { type: 'string' },
        shippingTracking: { type: 'string' },
        shippingTrackingURL: { type: 'string' },
        customerInfo: {
          type: {
            type: 'hash',
            fields: {
              fullName: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
        purchasedItems: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                count: { type: 'number' },
                rowTotal: {
                  type: {
                    type: 'hash',
                    fields: {
                      unit: { type: 'string' },
                      value: { type: 'string' },
                      string: { type: 'string' },
                    },
                  },
                },
                productName: { type: 'string' },
                productSlug: { type: 'string' },
                variantId: { type: 'string' },
                variantName: { type: 'string' },
                variantSlug: { type: 'string' },
                variantSKU: { type: 'string' },
                variantImage: {
                  type: {
                    type: 'hash',
                    fields: {
                      url: { type: 'string' },
                    },
                  },
                },
                variantPrice: {
                  type: {
                    type: 'hash',
                    fields: {
                      unit: { type: 'string' },
                      value: { type: 'string' },
                      string: { type: 'string' },
                    },
                  },
                },
                weight: { type: 'number' },
                width: { type: 'number' },
                height: { type: 'number' },
                length: { type: 'number' },
              },
            },
          },
        },
        purchasedItemsCount: { type: 'number' },
        stripeDetails: {
          type: {
            type: 'hash',
            fields: {
              subscriptionId: { type: 'string' },
              paymentMethod: { type: 'string' },
              paymentIntentId: { type: 'string' },
              customerId: { type: 'string' },
              chargeId: { type: 'string' },
              disputeId: { type: 'string' },
              refundId: { type: 'string' },
              refundReason: { type: 'string' },
            },
          },
        },
        stripeCard: {
          type: {
            type: 'hash',
            fields: {
              last4: { type: 'string' },
              brand: { type: 'string' },
              ownerName: { type: 'string' },
              expires: {
                type: {
                  type: 'hash',
                  fields: {
                    year: { type: 'number' },
                    month: { type: 'number' },
                  },
                },
              },
            },
          },
        },
        customData: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
            },
          },
        },
        metadata: {
          type: {
            type: 'hash',
            fields: {
              isBuyNow: { type: 'boolean' },
            },
          },
        },
        isCustomerDeleted: { type: 'boolean' },
        isShippingRequired: { type: 'boolean' },
        totals: {
          type: {
            type: 'hash',
            fields: {
              subtotal: {
                type: {
                  type: 'hash',
                  fields: {
                    unit: { type: 'string' },
                    value: { type: 'string' },
                    string: { type: 'string' },
                  },
                },
              },
              extras: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      type: { type: 'string' },
                      name: { type: 'string' },
                      description: { type: 'string' },
                      price: {
                        type: {
                          type: 'hash',
                          fields: {
                            unit: { type: 'string' },
                            value: { type: 'string' },
                            string: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              total: {
                type: {
                  type: 'hash',
                  fields: {
                    unit: { type: 'string' },
                    value: { type: 'string' },
                    string: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        downloadFiles: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                id: { type: 'string' },
                name: { type: 'string' },
                url: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
});

export default WebflowUpdatedOrder;
