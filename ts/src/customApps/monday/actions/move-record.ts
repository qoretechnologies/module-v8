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
import { getMondayRecordIdAllowedValues } from './helpers/get-record-id-allowed-values';

const options = {
  board_id: {
    display_name: 'Board ID',
    short_desc: 'The ID of the board containing the record to move.',
    desc: 'The unique identifier of the board containing the record you want to move.',

    type: 'string',
    required: false,
    preselected: true,
    on_change: ['refetch'],
    allowed_values_creatable: true,
    get_allowed_values: getMondayBoardIdAllowedValues,
  },
  record_id: {
    display_name: 'Record ID',
    short_desc: 'The ID of the record to move.',
    desc: 'The unique identifier of the record you want to move.',

    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayRecordIdAllowedValues,
  },
  destination_group_id: {
    display_name: 'Destination Group ID',
    short_desc: 'The ID of the group to move the record to.',
    desc: 'The unique identifier of the group you want to move the record to.',

    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayGroupIdAllowedValues,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    data: {
      type: {
        type: 'hash',
        fields: {
          move_item_to_group: {
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

export const MoveRecord = QoreAppCreator.createAction({
  action: 'move-record',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  display_name: 'Move Record',
  short_desc: 'Transfer a record to another group or board.',
  desc:
    'Use this action to move a record from its current group or board ' +
    'to another specified group or board, maintaining its data and history.',

  api_function: (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const url = context?.conn_opts?.url;
    const recordId = data?.record_id;
    const groupId = data?.destination_group_id;

    if (!recordId || !token || !url || !groupId) {
      throw new Error(
        'record_id, destination_group_id, token and api url are required to move a Monday app record.'
      );
    }

    const query = `
    mutation MoveItem($recordId: ID!, $destinationGroupId: String!) {
      move_item_to_group(item_id: $recordId, group_id: $destinationGroupId) {
        id
      }
    }
  `;

    return callMondayAPI({
      query,
      variables: { recordId, destinationGroupId: groupId },
      token,
      url,
    });
  },
  options,
  response_type,
});
