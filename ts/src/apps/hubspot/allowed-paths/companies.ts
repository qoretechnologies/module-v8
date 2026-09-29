import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { buildHubspotActions } from '../helpers/schema-actions';
import { HUBSPOT_APP_NAME, HubspotAssociationsType, hubspotSearchSortsOption } from '../constants';
import { getHubspotCompanyAllowedValues } from '../helpers/get-company-allowed-values';
import { getHubspotCompanyIdPropertyAllowedValues } from '../helpers/get-id-property-allowed-values';
import { getHubspotCompanyPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';
import {
  getHubspotCompanyPropertiesType,
  getHubspotCompanyPropertiesTypeOptional,
} from '../helpers/get-object-properties';

const companyId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotCompanyAllowedValues,
} satisfies TQoreAppActionOverrideOption;

const propertiesQuery = {
  element_allowed_values_creatable: true,
  get_element_allowed_values: getHubspotCompanyPropertiesAllowedValues,
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
        properties: {
          required: true,
          get_dynamic_type: getHubspotCompanyPropertiesType,
        },
        associations: HubspotAssociationsType,
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
        properties: {
          required: true,
          get_dynamic_type: getHubspotCompanyPropertiesTypeOptional,
        },
      },
    },
    DELETE: {
      override_options: {
        companyId,
      },
    },
  },
  '/crm/v3/objects/companies/batch/upsert': {
    POST: {
      override_options: {
        'inputs.idProperty': {
          required: true,
          allowed_values_creatable: true,
          get_allowed_values: getHubspotCompanyIdPropertyAllowedValues,
        },
        'inputs.properties': {
          required: true,
          get_dynamic_type: getHubspotCompanyPropertiesTypeOptional,
        },
      },
    },
  },
  '/crm/v3/objects/companies/search': {
    POST: {
      override_options: {
        limit: {
          required: true,
          default_value: 10,
        },
        sorts: hubspotSearchSortsOption,
        properties: {
          type: {
            type: 'list',
            element_type: 'string',
            required: false,
          },
          get_element_allowed_values: getHubspotCompanyPropertiesAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const HUBSPOT_COMPANIES_ACTIONS = buildHubspotActions({
  schemaPath: 'companies',
  allowedPaths: HUBSPOT_COMPANIES_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
