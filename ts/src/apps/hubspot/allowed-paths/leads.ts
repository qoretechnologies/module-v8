import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import hubspotLeads from '../../../schemas/hubspot/leads.swagger.json';
import { getHubspotLeadAllowedValues } from '../helpers/get-lead-allowed-values';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import { OpenAPIV2 } from 'openapi-types';
import { HUBSPOT_APP_NAME } from '../constants';

const leadsId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotLeadAllowedValues,
} satisfies TQoreAppActionOverrideOption;

export const HUBSPOT_LEADS_ALLOWED_PATHS = {
  '/crm/v3/objects/leads/': {
    GET: {},
    POST: {},
  },
  '/crm/v3/objects/leads/batch/upsert': {
    POST: {},
  },
  '/crm/v3/objects/leads/search': {
    POST: {},
  },
  '/crm/v3/objects/leads/{leadsId}': {
    GET: {
      override_options: {
        leadsId,
      },
    },
    PATCH: {
      override_options: {
        leadsId,
      },
    },
    DELETE: {
      override_options: {
        leadsId,
      },
    },
  },
} satisfies TAllowedPaths;

export const HUBSPOT_LEADS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: hubspotLeads as unknown as OpenAPIV2.Document,
  allowedPaths: HUBSPOT_LEADS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
