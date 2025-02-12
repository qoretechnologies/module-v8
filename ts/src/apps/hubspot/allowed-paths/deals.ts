import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import hubspotDeals from '../../../schemas/hubspot/deals.swagger.json';
import { HUBSPOT_APP_NAME } from '../constants';
import { getHubspotDealAllowedValues } from '../helpers/get-deal-allowed-values';

const dealId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotDealAllowedValues,
} satisfies TQoreAppActionOverrideOption;

export const HUBSPOT_DEALS_ALLOWED_PATHS = {
  '/crm/v3/objects/deals': {
    GET: {},
    POST: {},
  },
  '/crm/v3/objects/deals/batch/upsert': {
    POST: {},
  },
  '/crm/v3/objects/deals/{dealId}': {
    GET: {
      override_options: {
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
    POST: {},
  },
} satisfies TAllowedPaths;

export const HUBSPOT_DEALS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: hubspotDeals as unknown as OpenAPIV2.Document,
  allowedPaths: HUBSPOT_DEALS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
