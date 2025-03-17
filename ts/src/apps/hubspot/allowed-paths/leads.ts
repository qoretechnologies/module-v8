import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import hubspotLeads from '../../../schemas/hubspot/leads.swagger.json';
import { getHubspotLeadAllowedValues } from '../helpers/get-lead-allowed-values';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import { OpenAPIV2 } from 'openapi-types';
import { HUBSPOT_APP_NAME, HubspotAssociationsType, hubspotSearchSortsOption } from '../constants';
import { getHubspotLeadPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';
import { getHubspotLeadIdPropertyAllowedValues } from '../helpers/get-id-property-allowed-values';
import {
  getHubspotLeadPropertiesType,
  getHubspotLeadPropertiesTypeOptional,
} from '../helpers/get-object-properties';

const leadsId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotLeadAllowedValues,
} satisfies TQoreAppActionOverrideOption;

const propertiesQuery = {
  element_allowed_values_creatable: true,
  get_element_allowed_values: getHubspotLeadPropertiesAllowedValues,
} satisfies TQoreAppActionOverrideOption;

export const HUBSPOT_LEADS_ALLOWED_PATHS = {
  '/crm/v3/objects/leads': {
    GET: {
      override_options: {
        properties: propertiesQuery,
      },
    },
    POST: {
      override_options: {
        properties: {
          required: true,
          get_dynamic_type: getHubspotLeadPropertiesType,
        },
        associations: HubspotAssociationsType,
      },
    },
  },
  '/crm/v3/objects/leads/batch/upsert': {
    POST: {
      override_options: {
        'inputs.idProperty': {
          required: true,
          allowed_values_creatable: true,
          get_allowed_values: getHubspotLeadIdPropertyAllowedValues,
        },
        'inputs.properties': {
          required: true,
          get_dynamic_type: getHubspotLeadPropertiesTypeOptional,
        },
      },
    },
  },
  '/crm/v3/objects/leads/search': {
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
          get_element_allowed_values: getHubspotLeadPropertiesAllowedValues,
        },
      },
    },
  },
  '/crm/v3/objects/leads/{leadsId}': {
    GET: {
      override_options: {
        leadsId,
        properties: propertiesQuery,
      },
    },
    PATCH: {
      override_options: {
        leadsId,
        properties: {
          required: true,
          get_dynamic_type: getHubspotLeadPropertiesTypeOptional,
        },
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
  schemaPath: 'leads',
  allowedPaths: HUBSPOT_LEADS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
