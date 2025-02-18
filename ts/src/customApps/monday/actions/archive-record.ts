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

const ArchiveRecordOptions = {
  board_id: {
    display_name: 'Board ID',
    short_desc: 'The ID of the board containing the record to archive.',
    desc: 'The unique identifier of the board containing the record you want to archive.',

    type: 'string',
    required: false,
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
} satisfies TQoreOptions;

const ArchiveRecordResponseType = {
  type: 'hash',
  fields: {
    data: {
      type: {
        type: 'hash',
        fields: {
          archive_item: {
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

export const ArchiveRecord = QoreAppCreator.createAction({
  action: 'archive-record',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  display_name: 'Archive Record',
  short_desc: 'Move a record to the archive.',
  desc:
    'This action allows you to archive a specific record,' +
    'effectively removing it from active views without permanently deleting it.',

  api_function: (data, _opts, context) => {
    const recordId = data?.record_id;
    const url = context?.conn_opts?.url;
    const token = context?.conn_opts?.token;

    if (!recordId || !token || !url) {
      throw new Error(
        'Both record_id, token and api url are required to archive a Monday app record.'
      );
    }

    const query = `
    mutation ArchiveItem($recordId: ID!) {
      archive_item(item_id: $recordId) {
        id
      }
    }
  `;

    return callMondayAPI({
      query,
      variables: { recordId },
      token,
      url,
    });
  },
  options: ArchiveRecordOptions,
  response_type: ArchiveRecordResponseType,
});
