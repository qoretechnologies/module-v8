import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import hubspotProducts from '../../../schemas/hubspot/products.swagger.json';
import { HUBSPOT_APP_NAME, HubspotAssociationsType, hubspotSearchSortsOption } from '../constants';
import { getHubspotProductIdPropertyAllowedValues } from '../helpers/get-id-property-allowed-values';
import {
  getHubspotProductPropertiesType,
  getHubspotProductPropertiesTypeOptional,
} from '../helpers/get-object-properties';
import { getHubspotProductAllowedValues } from '../helpers/get-product.allowed-values';
import { getHubspotProductPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';

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
        associations: HubspotAssociationsType,
        properties: {
          required: true,
          get_dynamic_type: getHubspotProductPropertiesType,
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
        'inputs.properties': {
          required: true,
          get_dynamic_type: getHubspotProductPropertiesTypeOptional,
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
        properties: {
          required: true,
          get_dynamic_type: getHubspotProductPropertiesTypeOptional,
        },
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
