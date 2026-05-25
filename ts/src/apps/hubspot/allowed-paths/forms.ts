import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import hubspotForms from '../../../schemas/hubspot/forms.swagger.json';
import { HUBSPOT_APP_NAME } from '../constants';
import { getHubspotFormAllowedValues } from '../helpers/get-form-allowed-values';

const formId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotFormAllowedValues,
} satisfies TQoreAppActionOverrideOption;

const formTypesOption = {
  type: {
    type: 'list',
    element_type: 'string',
    required: false,
  },
  element_allowed_values: [
    { value: 'hubspot', display_name: 'Native HubSpot form' },
    { value: 'captured', display_name: 'Captured external HTML form' },
    { value: 'flow', display_name: 'Pop-up / flow' },
    { value: 'blog_comment', display_name: 'Blog comment' },
    { value: 'all', display_name: 'All form types' },
  ],
} satisfies TQoreAppActionOverrideOption;

export const HUBSPOT_FORMS_ALLOWED_PATHS = {
  '/marketing/v3/forms': {
    GET: {
      override_options: {
        formTypes: formTypesOption,
        limit: {
          required: false,
          default_value: 20,
        },
      },
    },
    POST: {},
  },
  '/marketing/v3/forms/{formId}': {
    GET: {
      override_options: {
        formId,
      },
    },
    PUT: {
      override_options: {
        formId,
      },
    },
    PATCH: {
      override_options: {
        formId,
      },
    },
    DELETE: {
      override_options: {
        formId,
      },
    },
  },
} satisfies TAllowedPaths;

export const HUBSPOT_FORMS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: hubspotForms as unknown as OpenAPIV2.Document,
  schemaPath: 'forms',
  allowedPaths: HUBSPOT_FORMS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
