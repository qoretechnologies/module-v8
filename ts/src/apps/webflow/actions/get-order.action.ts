import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { WEBFLOW_APP_NAME, WebflowError } from '../constants';
import { createWebflowClient } from '../helpers/constants';
import { getWebflowSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';
import { getWebflowOrderIdAllowedValues } from '../helpers/get-order-id-allowed-values';

const action = 'get_order';
const options = {
  site: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    get_allowed_values: getWebflowSiteIdAllowedValues,
  },
  order: {
    type: 'string',
    depends_on: ['site'],
    get_allowed_values: getWebflowOrderIdAllowedValues,
    required: true,
  },
} satisfies TQoreOptions;

const getOrder = QoreAppCreator.createLocalizedAction<typeof options>({
  app: WEBFLOW_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, site, order } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['site', 'order'],
      ErrorClass: WebflowError,
    });

    try {
      const client = createWebflowClient(token);

      const response = await client.orders.get(site, order);

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
            isBuyNow: { type: 'bool' },
          },
        },
      },
      isCustomerDeleted: { type: 'bool' },
      isShippingRequired: { type: 'bool' },
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

export default getOrder;
