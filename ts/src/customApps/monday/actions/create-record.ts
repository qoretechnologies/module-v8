import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { MONDAY_APP_NAME } from '../constants';
import { callMondayAPI } from './constants';
import { getMondayBoardIdAllowedValues } from './helpers/get-board-id-allowed-values';
import { getMondayGroupIdAllowedValues } from './helpers/get-group-id-allowed-values';
import { getMondayBoardDependentOptions } from './helpers/get-board-dependent-options';

const options = {
  board_id: {
    display_name: 'Board ID',
    short_desc: 'The ID of the board where the record will be created.',
    desc: 'The unique identifier of the board where you want to create a new record.',

    type: 'string',
    required: false,
    preselected: true,
    on_change: ['refetch'],
    allowed_values_creatable: true,
    get_allowed_values: getMondayBoardIdAllowedValues,
    get_dependent_options: getMondayBoardDependentOptions,
  },

  group_id: {
    display_name: 'Group ID',
    short_desc: 'The ID of the group where the record will be created.',
    desc: 'The unique identifier of the group where you want to create a new record.',

    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayGroupIdAllowedValues,
  },

  item_name: {
    display_name: 'Item Name',
    short_desc: 'The name of the new record.',
    desc: 'The name of the new record you want to create.',

    type: 'string',
    required: true,
  },

  column_values: {
    display_name: 'Column Values',
    short_desc: 'The values to set for the record columns.',
    desc: 'The values to set for the columns of the record you want to create.',

    type: 'hash',
    required: false,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    account_id: {
      type: 'string',
    },
    data: {
      type: {
        type: 'hash',
        fields: {
          create_item: {
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

export const CreateRecord = QoreAppCreator.createAction({
  action: 'create-record',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  display_name: 'Create Record',
  short_desc: 'Add a new record to a board.',
  desc:
    'This action enables you to create a new record (item) in a specified board, ' +
    'allowing you to define initial column values upon creation.',

  api_function: (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const url = context?.conn_opts?.url;
    const boardId = data?.board_id;
    const groupId = data?.group_id;
    const itemName = data?.item_name;
    const columnValues = data?.column_values;

    if (!boardId || !groupId || !itemName || !token || !url) {
      throw new Error(
        'board_id, group_id, item_name, token, and api url are required to create a Monday app record.'
      );
    }

    const query = `
    mutation CreateItem($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON) {
      create_item(board_id: $boardId, group_id: $groupId, item_name: $itemName, column_values: $columnValues) {
        id
      }
    }
  `;

    return callMondayAPI({
      url,
      query,
      variables: { boardId, groupId, itemName, columnValues: JSON.stringify(columnValues) },
      token,
    });
  },
  options,
  response_type,
});
