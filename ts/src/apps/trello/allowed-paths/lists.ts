import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { getTrelloBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { getTrelloBoardListsIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import { removeTrelloFieldsFromQuery } from './constants';

export const TRELLO_LISTS_ALLOWED_PATHS = {
  '/lists': {
    POST: {
      override_options: {
        idBoard: {
          on_change: ['refetch'],
          get_allowed_values: getTrelloBoardIdAllowedValues,
        },
        idListSource: {
          allowed_values_creatable: true,
          get_allowed_values: getTrelloBoardListsIdAllowedValues,
        },
      },
    },
  },
  '/lists/{id}': {
    GET: {
      override_options: {
        idBoard: {
          type: 'string',
          required: false,
          preselected: true,
          on_change: ['refetch'],
          get_allowed_values: getTrelloBoardIdAllowedValues,
        },
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getTrelloBoardListsIdAllowedValues,
        },
      },
      request_data_converter: removeTrelloFieldsFromQuery(['idBoard']),
    },
    PUT: {
      override_options: {
        idBoard: {
          on_change: ['refetch'],
          preselected: true,
          allowed_values_creatable: true,
          get_allowed_values: getTrelloBoardIdAllowedValues,
        },
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getTrelloBoardListsIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;
