import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { getHubspotContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import { HUBSPOT_APP_NAME, hubspotSearchSortsOption } from '../constants';
import hubspotContacts from '../../../schemas/hubspot/contacts.swagger.json';
import { OpenAPIV2 } from 'openapi-types';
import { getHubspotContactPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';

const contactId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotContactAllowedValues,
} satisfies TQoreAppActionOverrideOption;

const propertiesQuery = {
  allowed_values_creatable: true,
  get_allowed_values: getHubspotContactPropertiesAllowedValues,
} satisfies TQoreAppActionOverrideOption;

export const HUBSPOT_CONTACTS_ALLOWED_PATHS = {
  '/crm/v3/objects/contacts': {
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
  '/crm/v3/objects/contacts/search': {
    POST: {
      override_options: {
        sorts: hubspotSearchSortsOption,
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
        properties: propertiesQuery,
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
  schemaPath: 'contacts',
  allowedPaths: HUBSPOT_CONTACTS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
