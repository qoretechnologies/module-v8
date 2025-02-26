import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import hubspotUsers from '../../../schemas/hubspot/users.swagger.json';
import { HUBSPOT_APP_NAME, hubspotSearchSortsOption } from '../constants';
import { getHubspotUserAllowedValues } from '../helpers/get-user-allowed-values';
import { getHubspotUserPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';
import { getHubspotUserIdPropertyAllowedValues } from '../helpers/get-id-property-allowed-values';

const userId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotUserAllowedValues,
} satisfies TQoreAppActionOverrideOption;

const propertiesQuery = {
  allowed_values_creatable: true,
  get_allowed_values: getHubspotUserPropertiesAllowedValues,
} satisfies TQoreAppActionOverrideOption;

export const HUBSPOT_USERS_ALLOWED_PATHS = {
  '/crm/v3/objects/users': {
    GET: {
      override_options: {
        properties: propertiesQuery,
      },
    },
  },
  '/crm/v3/objects/users/batch/upsert': {
    POST: {
      override_options: {
        'inputs.idProperty': {
          required: true,
          allowed_values_creatable: true,
          get_allowed_values: getHubspotUserIdPropertyAllowedValues,
        },
      },
    },
  },
  '/crm/v3/objects/users/search': {
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
          get_allowed_values: getHubspotUserPropertiesAllowedValues,
        },
      },
    },
  },
  '/crm/v3/objects/users/{userId}': {
    GET: {
      override_options: {
        userId,
        properties: propertiesQuery,
      },
    },
    PATCH: {
      override_options: {
        userId,
      },
    },
  },
} satisfies TAllowedPaths;

export const HUBSPOT_USERS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: hubspotUsers as unknown as OpenAPIV2.Document,
  schemaPath: 'users',
  allowedPaths: HUBSPOT_USERS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
