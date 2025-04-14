import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { getTrelloBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { getTrelloBoardLabelsIdAllowedValues } from '../helpers/get-label-id-allowed-values';
import { removeTrelloFieldsFromQuery } from './constants';

export const TRELLO_LABELS_ALLOWED_PATHS = {
  '/labels': {
    POST: {
      override_options: {
        idBoard: {
          get_allowed_values: getTrelloBoardIdAllowedValues,
        },
      },
    },
  },
  '/labels/{id}': {
    GET: {
      override_options: {
        idBoard: {
          on_change: ['refetch'],
          type: 'string',
          required: false,
          preselected: true,
          get_allowed_values: getTrelloBoardIdAllowedValues,
        },
        id: {
          get_allowed_values: getTrelloBoardLabelsIdAllowedValues,
        },
      },
      request_data_converter: removeTrelloFieldsFromQuery(['idBoard']),
    },
    PUT: {
      override_options: {
        idBoard: {
          on_change: ['refetch'],
          type: 'string',
          required: false,
          preselected: true,
          get_allowed_values: getTrelloBoardIdAllowedValues,
        },
        id: {
          get_allowed_values: getTrelloBoardLabelsIdAllowedValues,
        },
      },
      request_data_converter: removeTrelloFieldsFromQuery(['idBoard']),
    },
    DELETE: {
      override_options: {
        idBoard: {
          on_change: ['refetch'],
          type: 'string',
          required: false,
          preselected: true,
          get_allowed_values: getTrelloBoardIdAllowedValues,
        },
        id: {
          get_allowed_values: getTrelloBoardLabelsIdAllowedValues,
        },
      },
      request_data_converter: removeTrelloFieldsFromQuery(['idBoard']),
    },
  },
} satisfies TAllowedPaths;
