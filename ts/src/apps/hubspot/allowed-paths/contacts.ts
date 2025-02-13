import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { getHubspotContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import { HUBSPOT_APP_NAME } from '../constants';
import hubspotContacts from '../../../schemas/hubspot/contacts.swagger.json';
import { OpenAPIV2 } from 'openapi-types';
import { getHubspotContactPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';

const contactId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotContactAllowedValues,
} satisfies TQoreAppActionOverrideOption;

export const HUBSPOT_CONTACTS_ALLOWED_PATHS = {
  '/crm/v3/objects/contacts': {
    GET: {},
    POST: {},
  },
  '/crm/v3/objects/contacts/search': {
    POST: {
      override_options: {
        properties: {
          type: {
            type: 'list',
            element_type: 'string',
            required: false,
          },
          get_allowed_values: getHubspotContactPropertiesAllowedValues,
        },
      },
    },
  },
  '/crm/v3/objects/contacts/{contactId}': {
    GET: {
      override_options: {
        contactId,
      },
    },
    PATCH: {
      override_options: {
        contactId,
      },
    },
    DELETE: {
      override_options: {
        contactId,
      },
    },
  },
} satisfies TAllowedPaths;

export const HUBSPOT_CONTACTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: hubspotContacts as unknown as OpenAPIV2.Document,
  allowedPaths: HUBSPOT_CONTACTS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
