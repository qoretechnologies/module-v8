import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { OrdersRefundRequestReason } from 'webflow-api/api';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { WEBFLOW_APP_NAME, WebflowError } from '../constants';
import { createWebflowClient } from '../helpers/constants';
import { getWebflowOrderIdAllowedValues } from '../helpers/get-order-id-allowed-values';
import { getWebflowSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';

const action = 'mark_order_status';

const refundOrderOptions = {
  reason: {
    type: 'string',
    required: false,
    preselected: true,
    allowed_values: [
      { value: 'duplicate', display_name: 'Duplicate' },
      { value: 'fraudulent', display_name: 'Fraudulent' },
      { value: 'requested', display_name: 'Requested' },
    ],
  },
} satisfies TQoreOptions;

const fullfillOrderOptions = {
  sendOrderFulfilledEmail: {
    type: 'boolean',
    required: false,
    preselected: true,
  },
} satisfies TQoreOptions;

const options = {
  site: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    get_allowed_values: getWebflowSiteIdAllowedValues,
  },
  order: {
    type: 'string',
    required: true,
    depends_on: ['site'],
    get_allowed_values: getWebflowOrderIdAllowedValues,
  },
  status: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    default_value: 'fulfilled',
    allowed_values: [
      { value: 'fulfilled', display_name: 'Fulfilled' },
      { value: 'unfulfilled', display_name: 'Unfulfilled' },
      { value: 'refunded', display_name: 'Refunded' },
    ],
    get_dependent_options: (context) => {
      const status = context?.opts?.status;

      if (status === 'fulfilled') return fullfillOrderOptions;
      else if (status === 'unfulfilled') return {};
      else if (status === 'refunded') return refundOrderOptions;

      return {};
    },
  },
} satisfies TQoreOptions;

const markOrderStatus = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof refundOrderOptions> & Partial<typeof fullfillOrderOptions>
>({
  app: WEBFLOW_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, site, order, status } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['site', 'order', 'status'],
      ErrorClass: WebflowError,
    });

    const reason = obj?.reason as OrdersRefundRequestReason;
    const sendOrderFulfilledEmail = obj?.sendOrderFulfilledEmail || false;

    try {
      const client = createWebflowClient(token);

      let response;

      if (status === 'fulfilled') {
        response = await client.orders.updateFulfill(site, order, {
          sendOrderFulfilledEmail,
        });
      } else if (status === 'unfulfilled') {
        response = await client.orders.updateUnfulfill(site, order);
      } else if (status === 'refunded') {
        response = await client.orders.refund(site, order, {
          ...(reason && { reason }),
        });
      }

      return response;
    } catch (error) {
      throw new WebflowError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      orderId: { type: 'string' },
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
              productId: { type: 'string' },
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
});

export default markOrderStatus;
