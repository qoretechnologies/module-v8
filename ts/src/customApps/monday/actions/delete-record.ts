import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { MONDAY_APP_NAME } from '../constants';
import { callMondayAPI } from './constants';
import { getMondayBoardIdAllowedValues } from './helpers/get-board-id-allowed-values';
import { getMondayRecordIdAllowedValues } from './helpers/get-record-id-allowed-values';

const options = {
  board_id: {
    display_name: 'Board ID',
    short_desc: 'The ID of the board containing the record to delete.',
    desc: 'The unique identifier of the board containing the record you want to delete.',

    type: 'string',
    required: false,
    preselected: true,
    on_change: ['refetch'],
    allowed_values_creatable: true,
    get_allowed_values: getMondayBoardIdAllowedValues,
  },
  record_id: {
    display_name: 'Record ID',
    short_desc: 'The ID of the record to delete.',
    desc: 'The unique identifier of the record you want to delete.',

    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayRecordIdAllowedValues,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    account_id: {
      type: 'softnumber',
    },
    data: {
      type: {
        type: 'hash',
        fields: {
          delete_item: {
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

export const DeleteRecord = QoreAppCreator.createAction({
  action: 'delete-record',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  display_name: 'Delete Record',
  short_desc: 'Permanently remove a record.',
  desc: 'Use this action to permanently delete a specific record from a board, removing all associated data.',

  api_function: (data, _opts, context) => {
    const recordId = data?.record_id;
    const token = context?.conn_opts?.token;
    const url = context?.conn_opts?.url;

    if (!recordId || !token || !url) {
      throw new Error('record_id, token and api url are required to delete a Monday app record.');
    }

    const query = `
    mutation DeleteItem($recordId: ID!) {
      delete_item(item_id: $recordId) {
        id
      }
    }
  `;

    return callMondayAPI({ query, variables: { recordId }, token, url });
  },
  options,
  response_type,
});
