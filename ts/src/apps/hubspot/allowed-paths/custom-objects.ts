import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import hubspotCustomObjects from '../../../schemas/hubspot/custom-objects.swagger.json';
import { HUBSPOT_APP_NAME, HubspotAssociationsType, hubspotSearchSortsOption } from '../constants';
import { getHubspotCustomObjectTypeAllowedValues } from '../helpers/get-custom-object-type-allowed-values';
import { getHubspotCustomObjectIdAllowedValues } from '../helpers/get-custom-object-id-allowed-values';
import { getHubspotCustomObjectPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';
import { getHubspotCustomObjectIdPropertyAllowedValues } from '../helpers/get-id-property-allowed-values';
import { getHubspotCustomObjectPropertiesType } from '../helpers/get-object-properties';

const objectType = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotCustomObjectTypeAllowedValues,
} satisfies TQoreAppActionOverrideOption;

const objectId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotCustomObjectIdAllowedValues,
  depends_on: ['objectType'],
} satisfies TQoreAppActionOverrideOption;

const propertiesQuery = {
  allowed_values_creatable: true,
  depends_on: ['objectType'],
  get_allowed_values: getHubspotCustomObjectPropertiesAllowedValues,
} satisfies TQoreAppActionOverrideOption;

export const HUBSPOT_CUSTOM_OBJECTS_ALLOWED_PATHS = {
  '/crm/v3/objects/{objectType}': {
    GET: {
      override_options: {
        objectType,
        properties: propertiesQuery,
      },
    },
    POST: {
      override_options: {
        objectType,
        properties: {
          required: true,
          get_dynamic_type: getHubspotCustomObjectPropertiesType,
        },
        associations: HubspotAssociationsType,
      },
    },
  },
  '/crm/v3/objects/{objectType}/batch/upsert': {
    POST: {
      override_options: {
        objectType,
        'inputs.idProperty': {
          required: true,
          allowed_values_creatable: true,
          get_allowed_values: getHubspotCustomObjectIdPropertyAllowedValues,
        },
        'inputs.properties': {
          required: true,
          get_dynamic_type: getHubspotCustomObjectPropertiesType,
        },
      },
    },
  },
  '/crm/v3/objects/{objectType}/search': {
    POST: {
      override_options: {
        objectType,
        sorts: hubspotSearchSortsOption,
        properties: {
          depends_on: ['objectType'],
          type: {
            type: 'list',
            element_type: 'string',
            required: false,
          },
          get_element_allowed_values: getHubspotCustomObjectPropertiesAllowedValues,
        },
      },
    },
  },
  '/crm/v3/objects/{objectType}/{objectId}': {
    GET: {
      override_options: {
        objectType,
        objectId,
        properties: propertiesQuery,
      },
    },
    PATCH: {
      override_options: {
        objectType,
        objectId,
        properties: {
          required: true,
          get_dynamic_type: getHubspotCustomObjectPropertiesType,
        },
      },
    },
    DELETE: {
      override_options: {
        objectType,
        objectId,
      },
    },
  },
} satisfies TAllowedPaths;

export const HUBSPOT_CUSTOM_OBJECTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: hubspotCustomObjects as unknown as OpenAPIV2.Document,
  schemaPath: 'custom-objects',
  allowedPaths: HUBSPOT_CUSTOM_OBJECTS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
