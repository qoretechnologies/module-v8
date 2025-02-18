import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { MONDAY_APP_NAME } from '../constants';
import { getMondayBoardIdAllowedValues } from './helpers/get-board-id-allowed-values';
import { getMondayRecordIdAllowedValues } from './helpers/get-record-id-allowed-values';
import { getMondayColumnIdAllowedValues } from './helpers/get-column-id-allowed-values';
import { callMondayAPI } from './constants';

const options = {
  board_id: {
    display_name: 'Board ID',
    short_desc: 'The ID of the board containing the record to archive.',
    desc: 'The unique identifier of the board containing the record you want to archive.',

    type: 'string',
    required: true,
    preselected: true,
    on_change: ['refetch'],
    allowed_values_creatable: true,
    get_allowed_values: getMondayBoardIdAllowedValues,
  },
  record_id: {
    display_name: 'Record ID',
    short_desc: 'The ID of the record to archive.',
    desc: 'The unique identifier of the record you want to archive.',

    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayRecordIdAllowedValues,
  },
  column_id: {
    display_name: 'Column ID',
    short_desc: 'The ID of the column to clear.',
    desc: 'The unique identifier of the column you want to clear.',

    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayColumnIdAllowedValues,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    data: {
      type: {
        type: 'hash',
        fields: {
          change_column_value: {
            type: {
              type: 'hash',
              fields: {
                id: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

export const ClearColumnValue = QoreAppCreator.createAction({
  action: 'clear-column-value',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  display_name: 'Clear Column Value',
  short_desc: 'Remove data from a column in a record.',
  desc: 'Use this action to clear the content of a specified column within a record, resetting its value to empty.',

  api_function: (data, _opts, context) => {
    const recordId = data?.record_id;
    const columnId = data?.column_id;
    const boardId = data?.board_id;
    const url = context?.conn_opts?.url;
    const token = context?.conn_opts?.token;

    if (!recordId || !columnId || !token || !url || !boardId) {
      throw new Error(
        'All record_id, column_id, board_id, token,api url are required to clear a Monday app column value.'
      );
    }

    const query = `
      mutation ClearColumnValue($boardId: ID!, $recordId: ID!, $columnId: String!) {
        change_column_value(item_id: $recordId, column_id: $columnId, board_id: $boardId, value: "{}") {
          id
        }
      }
      `;

    return callMondayAPI({
      query,
      variables: { recordId, columnId, boardId },
      token,
      url,
    });
  },
  options,
  response_type,
});
