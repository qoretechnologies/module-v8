import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { MONDAY_APP_NAME } from '../constants';
import { getMondayBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { getMondayRecordIdAllowedValues } from '../helpers/get-record-id-allowed-values';
import { callMondayAPI } from '../helpers/constants';

const options = {
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

const response_type = {
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

const DeleteRecord = QoreAppCreator.createLocalizedAction({
  action: 'delete_record',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,

  api_function: async (data, _opts, context) => {
    const recordId = data?.record_id;
    const token = context?.conn_opts?.token;

    if (!recordId || !token) {
      throw new Error('record_id, token are required to delete a Monday app record.');
    }

    const query = `
    mutation DeleteItem($recordId: ID!) {
      delete_item(item_id: $recordId) {
        id
        name
      }
    }
  `;

    const response = await callMondayAPI<{ data: { delete_item: { id: string; name: string } } }>({
      query,
      variables: { recordId },
      token,
    });

    return response.data?.delete_item;
  },
  options,
  response_type,
});

export default DeleteRecord;
