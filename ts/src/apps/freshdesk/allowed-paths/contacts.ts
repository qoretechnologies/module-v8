import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import freshDeskSchema from '../../../schemas/freshdesk.swagger.json';
import { FRESHDESK_APP_NAME } from '../constants';
import { getFreshdeskContactIdAllowedValues } from '../helpers/get-contact-id-allowed-values';

export const FRESHDESK_CONTACTS_ALLOWED_PATHS = {
  '/api/v2/contacts': {
    GET: {},
    POST: {
      override_options: {
        unique_external_id: {
          required_groups: ['create_contact'],
        },
        twitter_id: {
          required_groups: ['create_contact'],
        },
        email: {
          required_groups: ['create_contact'],
        },
        mobile: {
          required_groups: ['create_contact'],
        },
        phone: {
          required_groups: ['create_contact'],
        },
      },
    },
  },
  '/api/v2/contacts/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskContactIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskContactIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskContactIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/api/v2/contacts/{id}/hard_delete': {
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskContactIdAllowedValues,
          allowed_values_creatable: true,
        },
        force: {
          default_value: true,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const FRESHDESK_CONTACTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: freshDeskSchema,
  allowedPaths: FRESHDESK_CONTACTS_ALLOWED_PATHS,
  app: FRESHDESK_APP_NAME,
});
