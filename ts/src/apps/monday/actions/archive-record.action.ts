import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { MONDAY_APP_NAME } from '../constants';
import { callMondayAPI } from '../helpers/constants';
import { getMondayBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { getMondayRecordIdAllowedValues } from '../helpers/get-record-id-allowed-values';

const ArchiveRecordOptions = {
  board_id: {
    type: 'string',
    required: false,
    preselected: true,
    on_change: ['refetch'],
    allowed_values_creatable: true,
    get_allowed_values: getMondayBoardIdAllowedValues,
  },
  record_id: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayRecordIdAllowedValues,
  },
} satisfies TQoreOptions;

const ArchiveRecordResponseType = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
  },
} satisfies TQoreResponseType;

const ArchiveRecord = QoreAppCreator.createLocalizedAction({
  action: 'archive_record',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const recordId = data?.record_id;
    const token = context?.conn_opts?.token;

    if (!recordId || !token) {
      throw new Error('Both record_id and token are required to archive a Monday app record.');
    }

    const query = `
    mutation ArchiveItem($recordId: ID!) {
      archive_item(item_id: $recordId) {
        id
        name
      }
    }
  `;

    const response = await callMondayAPI<{
      data: {
        archive_item: {
          id: string;
          name: string;
        };
      };
    }>({
      query,
      variables: { recordId },
      token,
    });

    return response.data?.archive_item;
  },
  options: ArchiveRecordOptions,
  response_type: ArchiveRecordResponseType,
});

export default ArchiveRecord;
