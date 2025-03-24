import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { getPipedriveDealIdAllowedValues } from '../helpers/get-deal-id-allowed-values';
import { getPipedriveLeadIdAllowedValues } from '../helpers/get-lead-id-allowed-values';
import { getPipedriveNoteIdAllowedValues } from '../helpers/get-note-id-allowed-values';
import { getPipedriveOrganizationIdAllowedValues } from '../helpers/get-organization-id-allowed-values';
import { getPipedrivePersonIdAllowedValues } from '../helpers/get-person-id-allowed-values';
import { getPipedriveUserIdAllowedValues } from '../helpers/get-user-id-allowed-values';

export const PIPEDRIVE_NOTES_ALLOWED_PATHS = {
  '/notes': {
    GET: {
      override_options: {
        user_id: {
          get_allowed_values: getPipedriveUserIdAllowedValues,
        },
        lead_id: {
          get_allowed_values: getPipedriveLeadIdAllowedValues,
        },
        deal_id: {
          get_allowed_values: getPipedriveDealIdAllowedValues,
        },
        person_id: {
          get_allowed_values: getPipedrivePersonIdAllowedValues,
        },
        org_id: {
          get_allowed_values: getPipedriveOrganizationIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        deal_id: {
          get_allowed_values: getPipedriveDealIdAllowedValues,
          required_groups: ['create_note'],
        },
        lead_id: {
          get_allowed_values: getPipedriveLeadIdAllowedValues,
          required_groups: ['create_note'],
        },
        org_id: {
          get_allowed_values: getPipedriveOrganizationIdAllowedValues,
          required_groups: ['create_note'],
        },
        person_id: {
          get_allowed_values: getPipedrivePersonIdAllowedValues,
          required_groups: ['create_note'],
        },
        user_id: {
          get_allowed_values: getPipedriveUserIdAllowedValues,
        },
      },
    },
  },
  '/notes/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveNoteIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveNoteIdAllowedValues,
        },
        deal_id: {
          get_allowed_values: getPipedriveDealIdAllowedValues,
        },
        lead_id: {
          get_allowed_values: getPipedriveLeadIdAllowedValues,
        },
        org_id: {
          get_allowed_values: getPipedriveOrganizationIdAllowedValues,
        },
        person_id: {
          get_allowed_values: getPipedrivePersonIdAllowedValues,
        },
        user_id: {
          get_allowed_values: getPipedriveUserIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveNoteIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;
