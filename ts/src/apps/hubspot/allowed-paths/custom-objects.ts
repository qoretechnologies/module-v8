import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import hubspotCustomObjects from '../../../schemas/hubspot/custom-objects.swagger.json';
import { HUBSPOT_APP_NAME } from '../constants';
import { getHubspotCustomObjectTypeAllowedValues } from '../helpers/get-custom-object-type-allwed-values';
import { getHubspotCustomObjectIdAllowedValues } from '../helpers/get-cusom-object-id-allowed-values';

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

export const HUBSPOT_CUSTOM_OBJECTS_ALLOWED_PATHS = {
  '/crm/v3/objects/{objectType}': {
    GET: {
      override_options: {
        objectType,
      },
    },
    POST: {
      override_options: {
        objectType,
      },
    },
  },
  '/crm/v3/objects/{objectType}/batch/upsert': {
    POST: {
      override_options: {
        objectType,
      },
    },
  },
  '/crm/v3/objects/{objectType}/search': {
    POST: {
      override_options: {
        objectType,
      },
    },
  },
  '/crm/v3/objects/{objectType}/{objectId}': {
    GET: {
      override_options: {
        objectType,
        objectId,
      },
    },
    PATCH: {
      override_options: {
        objectType,
        objectId,
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
  allowedPaths: HUBSPOT_CUSTOM_OBJECTS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
