import {
  CatalogType,
  IMoney,
  ITimePeriod,
  IUnitPriceOverride,
  TaxMode,
} from '@paddle/paddle-node-sdk';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../constants';
import { createPaddleClient } from '../helpers/constants';
import { PaddleCountryAllowedValues } from '../helpers/get-country-code-allowed-values';
import { PaddleCurrencyAllowedValues } from '../helpers/get-currency-allowed-values';
import { PaddleIntervalAllowedValues } from '../helpers/get-interval-allowed-values';
import { getPaddlePriceIdAllowedValues } from '../helpers/get-price-id-allowed-values';
import { PaddleStatusAllowedValues } from '../helpers/get-status-allowed-values';
import { PaddleTaxModeAllowedValues } from '../helpers/get-tax-mode-allowed-values';
import { PaddleTypeAllowedValues } from '../helpers/get-type-allowed-values';

const options = {
  price_id: {
    required: true,
    type: 'string',
    get_allowed_values: getPaddlePriceIdAllowedValues,
  },
  description: {
    required: false,
    type: 'string',
  },
  unit_price: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        amount: { type: 'string', required: true },
        currencyCode: {
          type: 'string',
          required: true,
          allowed_values: PaddleCurrencyAllowedValues,
        },
      },
    },
  },
  type: {
    type: 'string',
    required: false,
    allowed_values: PaddleTypeAllowedValues,
  },
  name: {
    required: false,
    preselected: true,
    type: 'string',
  },

  billing_cycle: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        frequency: {
          type: 'integer',
          required: true,
        },
        interval: {
          type: 'string',
          required: true,
          allowed_values: PaddleIntervalAllowedValues,
        },
      },
    },
  },
  trial_period: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        frequency: {
          type: 'integer',
          required: true,
        },
        interval: {
          type: 'string',
          required: true,
          allowed_values: PaddleIntervalAllowedValues,
        },
      },
    },
  },
  tax_mode: {
    type: 'string',
    required: false,
    allowed_values: PaddleTaxModeAllowedValues,
  },
  unit_price_overrides: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          countryCodes: {
            required: true,
            type: {
              type: 'list',
              element_type: 'string',
            },
            element_allowed_values: PaddleCountryAllowedValues,
          },
          unitPrice: {
            required: true,
            type: {
              type: 'hash',
              fields: {
                amount: { type: 'string', required: true },
                currencyCode: {
                  type: 'string',
                  required: true,
                  allowed_values: PaddleCurrencyAllowedValues,
                },
              },
            },
          },
        },
      },
    },
  },
  quantity: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        minimum: { type: 'integer', required: true },
        maximum: { type: 'integer', required: true },
      },
    },
  },
  status: {
    type: 'string',
    required: false,
    preselected: true,
    allowed_values: PaddleStatusAllowedValues,
  },
  custom_data: {
    type: 'hash',
    required: false,
  },
} satisfies TQoreOptions;

const updatePrice = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'update_price',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type, price_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['price_id'],
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const { type, name, quantity, custom_data, description } = obj || {};

    const billingCycle = obj?.billing_cycle as ITimePeriod;
    const trialPeriod = obj?.trial_period as ITimePeriod;
    const taxMode = obj?.tax_mode as TaxMode;
    const unitPriceOverrides = obj?.unit_price_overrides as IUnitPriceOverride[];
    const unitPrice = obj?.unit_price as IMoney;

    try {
      const client = createPaddleClient(token, instance_type);

      const product = await client.prices.update(price_id, {
        ...(unitPrice && { unitPrice }),
        ...(description && { description }),
        ...(type && { type: type as CatalogType }),
        ...(name && { name }),
        ...(billingCycle && { billingCycle }),
        ...(trialPeriod && { trialPeriod }),
        ...(taxMode && { taxMode }),
        ...(unitPriceOverrides && { unitPriceOverrides }),
        ...(quantity && { quantity }),
        ...(custom_data && { customData: custom_data }),
      });

      return product;
    } catch (error) {
      throw new PaddleError(`Failed to create a price: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'integer' },
      productId: { type: 'integer' },
      type: { type: 'string' },
      description: { type: 'string' },
      name: { type: 'string' },
      billingCycle: {
        type: {
          type: 'hash',
          fields: {
            interval: { type: 'string' },
            frequency: { type: 'integer' },
          },
        },
      },
      trialPeriod: {
        type: {
          type: 'hash',
          fields: {
            interval: { type: 'string' },
            frequency: { type: 'integer' },
            requiresPaymentMethod: { type: 'boolean' },
          },
        },
      },
      taxMode: { type: 'string' },
      unitPrice: {
        type: {
          type: 'hash',
          fields: {
            amount: { type: 'number' },
            currencyCode: { type: 'string' },
          },
        },
      },
      unitPriceOverrides: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              countryCodes: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              unitPrice: {
                type: {
                  type: 'hash',
                  fields: {
                    amount: { type: 'number' },
                    currencyCode: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      customData: { type: 'hash' },
      status: { type: 'string' },
      quantity: {
        type: {
          type: 'hash',
          fields: {
            minimum: { type: 'integer' },
            maximum: { type: 'integer' },
          },
        },
      },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
      product: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'integer' },
            name: { type: 'string' },
            taxCategory: { type: 'string' },
            type: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string' },
            imageUrl: { type: 'string' },
            customData: { type: 'hash' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
      },
    },
  } satisfies TQoreResponseType,
});

export default updatePrice;
