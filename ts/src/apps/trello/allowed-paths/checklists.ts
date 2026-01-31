import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { getTrelloBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { getTrelloBoardListsIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import { getTrelloListCardsIdAllowedValues } from '../helpers/get-card-id-allowed-values';
import { getTrelloCardChecklistsIdAllowedValues } from '../helpers/get-checklist-id-allowed-values';
import { removeTrelloFieldsFromQuery } from './constants';
import { getTrelloBoardMembersIdAllowedValues } from '../helpers/get-board-members-allowed-values';

export const TRELLO_CHECKLISTS_ALLOWED_PATHS = {
  '/checklists/{id}/checkItems': {
    POST: {
      override_options: {
        idBoard: {
          type: 'string',
          required: false,
          preselected: true,
          get_allowed_values: getTrelloBoardIdAllowedValues,
          on_change: ['refetch'],
        },
        idList: {
          type: 'string',
          required: false,
          preselected: true,
          allowed_values_creatable: true,
          get_allowed_values: getTrelloBoardListsIdAllowedValues,
          on_change: ['refetch'],
        },
        idCard: {
          type: 'string',
          required: false,
          preselected: true,
          allowed_values_creatable: true,
          get_allowed_values: getTrelloListCardsIdAllowedValues,
          on_change: ['refetch'],
        },
        idMember: {
          allowed_values_creatable: true,
          get_allowed_values: getTrelloBoardMembersIdAllowedValues,
        },
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getTrelloCardChecklistsIdAllowedValues,
        },
      },
      request_data_converter: removeTrelloFieldsFromQuery(['idBoard', 'idList', 'idCard']),
    },
    GET: {
      override_options: {
        idBoard: {
          type: 'string',
          required: false,
          preselected: true,
          get_allowed_values: getTrelloBoardIdAllowedValues,
          on_change: ['refetch'],
        },
        idList: {
          type: 'string',
          required: false,
          preselected: true,
          allowed_values_creatable: true,
          get_allowed_values: getTrelloBoardListsIdAllowedValues,
          on_change: ['refetch'],
        },
        idCard: {
          type: 'string',
          required: false,
          preselected: true,
          allowed_values_creatable: true,
          get_allowed_values: getTrelloListCardsIdAllowedValues,
          on_change: ['refetch'],
        },
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getTrelloCardChecklistsIdAllowedValues,
        },
      },
      request_data_converter: removeTrelloFieldsFromQuery(['idBoard', 'idList', 'idCard']),
    },
  },
} satisfies TAllowedPaths;
