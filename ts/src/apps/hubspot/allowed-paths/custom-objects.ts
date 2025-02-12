import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import hubspotCustomObjects from '../../../schemas/hubspot/custom-objects.swagger.json';
import { HUBSPOT_APP_NAME } from '../constants';

export const HUBSPOT_CUSTOM_OBJECTS_ALLOWED_PATHS = {
  '/crm/v3/objects/{objectType}': {
    GET: {},
    POST: {},
  },
  '/crm/v3/objects/{objectType}/batch/upsert': {
    POST: {},
  },
  '/crm/v3/objects/{objectType}/search': {
    POST: {},
  },
  '/crm/v3/objects/{objectType}/{objectId}': {
    GET: {},
    PATCH: {},
    DELETE: {},
  },
} satisfies TAllowedPaths;

export const HUBSPOT_CUSTOM_OBJECTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: hubspotCustomObjects as unknown as OpenAPIV2.Document,
  allowedPaths: HUBSPOT_CUSTOM_OBJECTS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
