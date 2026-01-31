import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { getTrelloBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { getTrelloBoardMembersIdAllowedValues } from '../helpers/get-board-members-allowed-values';
import { getTrelloListCardsIdAllowedValues } from '../helpers/get-card-id-allowed-values';
import { getTrelloCardChecklistsIdAllowedValues } from '../helpers/get-checklist-id-allowed-values';
import { getTrelloChecklistItemsIdAllowedValues } from '../helpers/get-checklist-item-id-allowed-values';
import { getTrelloBoardLabelsIdAllowedValues } from '../helpers/get-label-id-allowed-values';
import { getTrelloBoardListsIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import { removeTrelloFieldsFromQuery } from './constants';

export const TRELLO_CARDS_ALLOWED_PATHS = {
  '/cards': {
    POST: {
      override_options: {
        idBoard: {
          type: 'string',
          required: true,
          get_allowed_values: getTrelloBoardIdAllowedValues,
          on_change: ['refetch'],
        },
        idList: {
          depends_on: ['idBoard'],
          allowed_values_creatable: true,
          get_allowed_values: getTrelloBoardListsIdAllowedValues,
        },
        idCardSource: {
          depends_on: ['idList'],
          allowed_values_creatable: true,
          get_allowed_values: getTrelloListCardsIdAllowedValues,
        },
        idMembers: {
          depends_on: ['idBoard'],
          allowed_values_creatable: true,
          get_element_allowed_values: getTrelloBoardMembersIdAllowedValues,
        },
        idLabels: {
          depends_on: ['idBoard'],
          allowed_values_creatable: true,
          get_element_allowed_values: getTrelloBoardLabelsIdAllowedValues,
        },
      },
      request_data_converter: removeTrelloFieldsFromQuery(['idBoard']),
    },
  },
  '/cards/{id}': {
    PUT: {
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
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getTrelloListCardsIdAllowedValues,
        },
      },
      request_data_converter: removeTrelloFieldsFromQuery(['idBoard']),
    },
  },
  '/cards/{id}/actions/comments': {
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
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getTrelloListCardsIdAllowedValues,
        },
      },
      request_data_converter: removeTrelloFieldsFromQuery(['idBoard', 'idList']),
    },
  },
  '/cards/{id}/checkItem/{idCheckItem}': {
    PUT: {
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
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getTrelloListCardsIdAllowedValues,
        },
        idChecklist: {
          allowed_values_creatable: true,
          get_allowed_values: getTrelloCardChecklistsIdAllowedValues,
          on_change: ['refetch'],
          preselected: true,
        },
        idCheckItem: {
          allowed_values_creatable: true,
          get_allowed_values: getTrelloChecklistItemsIdAllowedValues,
        },
      },
      request_data_converter: removeTrelloFieldsFromQuery(['idBoard', 'idList']),
    },
  },
  '/cards/{id}/idLabels': {
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
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getTrelloListCardsIdAllowedValues,
        },
      },
      request_data_converter: removeTrelloFieldsFromQuery(['idBoard', 'idList']),
    },
  },
  '/cards/{id}/idMembers': {
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
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getTrelloListCardsIdAllowedValues,
        },
        value: {
          required: true,
          allowed_values_creatable: true,
          get_allowed_values: getTrelloBoardMembersIdAllowedValues,
        },
      },
      request_data_converter: removeTrelloFieldsFromQuery(['idBoard', 'idList']),
    },
  },
} satisfies TAllowedPaths;
