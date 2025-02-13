import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import hubspotUsers from '../../../schemas/hubspot/users.swagger.json';
import { HUBSPOT_APP_NAME } from '../constants';
import { getHubspotUserAllowedValues } from '../helpers/get-user-allowed-values';
import { getHubspotUserPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';

const userId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotUserAllowedValues,
} satisfies TQoreAppActionOverrideOption;

export const HUBSPOT_USERS_ALLOWED_PATHS = {
  '/crm/v3/objects/users': {
    GET: {},
    POST: {},
  },
  '/crm/v3/objects/users/batch/upsert': {
    POST: {},
  },
  '/crm/v3/objects/users/search': {
    POST: {
      override_options: {
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
      },
    },
    PATCH: {
      override_options: {
        userId,
      },
    },
    DELETE: {
      override_options: {
        userId,
      },
    },
  },
} satisfies TAllowedPaths;

export const HUBSPOT_USERS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: hubspotUsers as unknown as OpenAPIV2.Document,
  allowedPaths: HUBSPOT_USERS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
