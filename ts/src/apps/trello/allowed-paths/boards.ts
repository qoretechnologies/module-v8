import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { getTrelloOrganizationIdAllowedValues } from '../helpers/get-organization-id-allowed-values';
import { getTrelloBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { getTrelloBoardMembersIdAllowedValues } from '../helpers/get-board-members-allowed-values';

export const TRELLO_BOARDS_ALLOWED_PATHS = {
  '/boards': {
    POST: {
      override_options: {
        idOrganization: {
          get_allowed_values: getTrelloOrganizationIdAllowedValues,
        },
        idBoardSource: {
          get_allowed_values: getTrelloBoardIdAllowedValues,
        },
      },
    },
  },
  '/boards/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getTrelloBoardIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getTrelloBoardIdAllowedValues,
        },
        idOrganization: {
          get_allowed_values: getTrelloOrganizationIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getTrelloBoardIdAllowedValues,
        },
      },
    },
  },
  '/boards/{id}/members/{idMember}': {
    PUT: {
      override_options: {
        id: {
          on_change: ['refetch'],
          get_allowed_values: getTrelloBoardIdAllowedValues,
        },
        idMember: {
          depends_on: ['id'],
          get_allowed_values: getTrelloBoardMembersIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;
