import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import hubspotCompanies from '../../../schemas/hubspot/companies.swagger.json';
import { HUBSPOT_APP_NAME, hubspotSearchSortsOption } from '../constants';
import { getHubspotCompanyAllowedValues } from '../helpers/get-company-allowed-values';
import { getHubspotCompanyPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';

const companyId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotCompanyAllowedValues,
} satisfies TQoreAppActionOverrideOption;

const propertiesQuery = {
  allowed_values_creatable: true,
  get_allowed_values: getHubspotCompanyPropertiesAllowedValues,
} satisfies TQoreAppActionOverrideOption;

export const HUBSPOT_COMPANIES_ALLOWED_PATHS = {
  '/crm/v3/objects/companies': {
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
  '/crm/v3/objects/companies/{companyId}': {
    GET: {
      override_options: {
        companyId,
        properties: propertiesQuery,
      },
    },
    PATCH: {
      override_options: {
        companyId,
      },
    },
    DELETE: {
      override_options: {
        companyId,
      },
    },
  },
  '/crm/v3/objects/companies/batch/upsert': {
    POST: {},
  },
  '/crm/v3/objects/companies/search': {
    POST: {
      override_options: {
        sorts: hubspotSearchSortsOption,
        properties: {
          type: {
            type: 'list',
            element_type: 'string',
            required: false,
          },
          get_allowed_values: getHubspotCompanyPropertiesAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const HUBSPOT_COMPANIES_ACTIONS = buildActionsFromSwaggerSchema({
  schema: hubspotCompanies as unknown as OpenAPIV2.Document,
  schemaPath: 'companies',
  allowedPaths: HUBSPOT_COMPANIES_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
