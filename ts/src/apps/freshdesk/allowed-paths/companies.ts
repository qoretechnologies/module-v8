import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import freshDeskSchema from '../../../schemas/freshdesk.swagger.json';
import { FRESHDESK_APP_NAME } from '../constants';
import { getFreshdeskCompanyIdAllowedValues } from '../helpers/get-company-id-allowed-values';

export const FRESHDESK_COMPANIES_ALLOWED_PATHS = {
  '/api/v2/companies': {
    GET: {},
    POST: {
      override_options: {
        name: {
          required: true,
        },
      },
    },
  },
  '/api/v2/companies/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskCompanyIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskCompanyIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskCompanyIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const FRESHDESK_COMPANIES_ACTIONS = buildActionsFromSwaggerSchema({
  schema: freshDeskSchema,
  allowedPaths: FRESHDESK_COMPANIES_ALLOWED_PATHS,
  app: FRESHDESK_APP_NAME,
});
