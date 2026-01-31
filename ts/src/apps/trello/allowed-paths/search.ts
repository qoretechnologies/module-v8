import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { getTrelloOrganizationIdAllowedValues } from '../helpers/get-organization-id-allowed-values';
import { getTrelloBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';

export const TRELLO_SEARCH_ALLOWED_PATHS = {
  '/search/members': {
    GET: {
      override_options: {
        idOrganization: {
          get_allowed_values: getTrelloOrganizationIdAllowedValues,
        },
        idBoard: {
          get_allowed_values: getTrelloBoardIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;
