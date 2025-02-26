import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import hubspotProducts from '../../../schemas/hubspot/products.swagger.json';
import { getHubspotProductAllowedValues } from '../helpers/get-product.allowed-values';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import { OpenAPIV2 } from 'openapi-types';
import { HUBSPOT_APP_NAME, hubspotSearchSortsOption } from '../constants';
import { getHubspotProductPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';
import { getHubspotProductIdPropertyAllowedValues } from '../helpers/get-id-property-allowed-values';

const productId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotProductAllowedValues,
} satisfies TQoreAppActionOverrideOption;

const propertiesQuery = {
  allowed_values_creatable: true,
  get_allowed_values: getHubspotProductPropertiesAllowedValues,
} satisfies TQoreAppActionOverrideOption;

export const HUBSPOT_PRODUCTS_ALLOWED_PATHS = {
  '/crm/v3/objects/products': {
    GET: {
      override_options: {
        properties: propertiesQuery,
      },
    },
    POST: {
      override_options: {
        associations: {
          required: false,
        },
      },
    },
  },
  '/crm/v3/objects/products/batch/upsert': {
    POST: {
      override_options: {
        'inputs.idProperty': {
          required: true,
          allowed_values_creatable: true,
          get_allowed_values: getHubspotProductIdPropertyAllowedValues,
        },
      },
    },
  },
  '/crm/v3/objects/products/search': {
    POST: {
      override_options: {
        sorts: hubspotSearchSortsOption,
        limit: {
          required: true,
          default_value: 10,
        },
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
        properties: propertiesQuery,
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
  schemaPath: 'products',
  allowedPaths: HUBSPOT_PRODUCTS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
