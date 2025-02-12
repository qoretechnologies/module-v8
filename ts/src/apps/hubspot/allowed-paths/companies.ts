import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import hubspotCompanies from '../../../schemas/hubspot/companies.swagger.json';
import { HUBSPOT_APP_NAME } from '../constants';
import { getHubspotCompanyAllowedValues } from '../helpers/get-company-allowed-values';

const companyId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotCompanyAllowedValues,
} satisfies TQoreAppActionOverrideOption;

export const HUBSPOT_COMPANIES_ALLOWED_PATHS = {
  '/crm/v3/objects/companies': {
    GET: {},
    POST: {},
  },
  '/crm/v3/objects/companies/{companyId}': {
    GET: {
      override_options: {
        companyId,
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
    POST: {},
  },
} satisfies TAllowedPaths;

export const HUBSPOT_COMPANIES_ACTIONS = buildActionsFromSwaggerSchema({
  schema: hubspotCompanies as unknown as OpenAPIV2.Document,
  allowedPaths: HUBSPOT_COMPANIES_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
