import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import hubspotProducts from '../../../schemas/hubspot/products.swagger.json';
import { getHubspotProductAllowedValues } from '../helpers/get-product.allowe-values';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import { OpenAPIV2 } from 'openapi-types';
import { HUBSPOT_APP_NAME } from '../constants';
import { getHubspotProductPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';

const productId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotProductAllowedValues,
} satisfies TQoreAppActionOverrideOption;

export const HUBSPOT_PRODUCTS_ALLOWED_PATHS = {
  '/crm/v3/objects/products': {
    GET: {},
    POST: {},
  },
  '/crm/v3/objects/products/batch/upsert': {
    POST: {},
  },
  '/crm/v3/objects/products/search': {
    POST: {
      override_options: {
        properties: {
          type: {
            type: 'list',
            element_type: 'string',
            required: false,
          },
          get_allowed_values: getHubspotProductPropertiesAllowedValues,
        },
      },
    },
  },
  '/crm/v3/objects/products/{productId}': {
    GET: {
      override_options: {
        productId,
      },
    },
    PATCH: {
      override_options: {
        productId,
      },
    },
    DELETE: {
      override_options: {
        productId,
      },
    },
  },
} satisfies TAllowedPaths;

export const HUBSPOT_PRODUCTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: hubspotProducts as unknown as OpenAPIV2.Document,
  allowedPaths: HUBSPOT_PRODUCTS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
