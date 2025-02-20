import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { MONDAY_APP_NAME } from '../constants';
import { callMondayAPI } from './constants';
import { getMondayBoardDependentOptions } from './helpers/get-board-dependent-options';
import { getMondayBoardIdAllowedValues } from './helpers/get-board-id-allowed-values';
import { getMondayRecordIdAllowedValues } from './helpers/get-record-id-allowed-values';

const options = {
  board_id: {
    display_name: 'Board ID',
    short_desc: 'The ID of the board containing the record to update.',
    desc: 'The unique identifier of the board containing the record you want to update.',

    type: 'string',
    required: true,
    preselected: true,
    on_change: ['refetch'],
    allowed_values_creatable: true,
    get_allowed_values: getMondayBoardIdAllowedValues,
    get_dependent_options: getMondayBoardDependentOptions,
  },
  record_id: {
    display_name: 'Record ID',
    short_desc: 'The ID of the record to update.',
    desc: 'The unique identifier of the record you want to update.',

    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayRecordIdAllowedValues,
  },
} satisfies TQoreOptions;

const additionalOptions = {
  column_values: {
    display_name: 'Column Values',
    short_desc: 'The values to set for the record columns.',
    desc: 'The values to set for the columns of the record you want to create.',

    depends_on: ['board_id'],
    type: 'hash',
    required: false,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    data: {
      type: {
        type: 'hash',
        fields: {
          change_multiple_column_values: {
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

export const UpdateRecord = QoreAppCreator.createAction<
  Partial<typeof additionalOptions> & typeof options
>({
  action: 'update-record',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  display_name: 'Update Record',
  short_desc: `Modify the values of a record's columns.`,
  desc:
    'Use this action to update one or more column values of a specific record, ' +
    'allowing you to change its data as needed.',

  api_function: (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const url = context?.conn_opts?.url;
    const recordId = data?.record_id;
    const columnValues = data?.column_values;
    const boardId = data?.board_id;

    if (!recordId || !token || !url || !columnValues || !boardId) {
      throw new Error(
        'board_id, column_values, record_id, token and api url are required to update a Monday app record.'
      );
    }

    const query = `
    mutation UpdateItem($boardId: ID!, $recordId: ID!, $columnValues: JSON!) {
      change_multiple_column_values(
        board_id: $boardId,
        item_id: $recordId,
        column_values: $columnValues
      ) {
        id
      }
    }
  `;

    return callMondayAPI({
      url,
      query,
      variables: { recordId, columnValues: JSON.stringify(columnValues), boardId },
      token,
    });
  },
  options,
  response_type,
});
