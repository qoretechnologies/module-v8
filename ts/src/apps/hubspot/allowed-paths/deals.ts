import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import hubspotDeals from '../../../schemas/hubspot/deals.swagger.json';
import { HUBSPOT_APP_NAME, hubspotSearchSortsOption } from '../constants';
import { getHubspotDealAllowedValues } from '../helpers/get-deal-allowed-values';
import { getHubspotDealPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';

const dealId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotDealAllowedValues,
} satisfies TQoreAppActionOverrideOption;

const propertiesQuery = {
  allowed_values_creatable: true,
  get_allowed_values: getHubspotDealPropertiesAllowedValues,
} satisfies TQoreAppActionOverrideOption;

export const HUBSPOT_DEALS_ALLOWED_PATHS = {
  '/crm/v3/objects/deals': {
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
  '/crm/v3/objects/deals/batch/upsert': {
    POST: {},
  },
  '/crm/v3/objects/deals/{dealId}': {
    GET: {
      override_options: {
        properties: propertiesQuery,
        dealId,
      },
    },
    PATCH: {
      override_options: {
        dealId,
      },
    },
    DELETE: {
      override_options: {
        dealId,
      },
    },
  },
  '/crm/v3/objects/deals/search': {
    POST: {
      override_options: {
        sorts: hubspotSearchSortsOption,
        properties: {
          type: {
            type: 'list',
            element_type: 'string',
            required: false,
          },
          get_allowed_values: getHubspotDealPropertiesAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const HUBSPOT_DEALS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: hubspotDeals as unknown as OpenAPIV2.Document,
  schemaPath: 'deals',
  allowedPaths: HUBSPOT_DEALS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
