import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { getTrelloOrganizationIdAllowedValues } from '../helpers/get-organization-id-allowed-values';
import { getTrelloOrganizationMembersIdAllowedValues } from '../helpers/get-organization-members-allowed-values';

export const TRELLO_ORGANIZATIONS_ALLOWED_PATHS = {
  '/organizations': {
    POST: {},
  },
  '/organizations/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getTrelloOrganizationIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getTrelloOrganizationIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getTrelloOrganizationIdAllowedValues,
        },
      },
    },
  },
  '/organizations/{id}/boards': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getTrelloOrganizationIdAllowedValues,
        },
      },
    },
  },
  '/organizations/{id}/members': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getTrelloOrganizationIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getTrelloOrganizationIdAllowedValues,
        },
      },
    },
  },
  '/organizations/{id}/members/{idMember}': {
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getTrelloOrganizationIdAllowedValues,
          on_change: ['refetch'],
        },
        idMember: {
          depends_on: ['id'],
          get_allowed_values: getTrelloOrganizationMembersIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getTrelloOrganizationIdAllowedValues,
          on_change: ['refetch'],
        },
        idMember: {
          depends_on: ['id'],
          get_allowed_values: getTrelloOrganizationMembersIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;
