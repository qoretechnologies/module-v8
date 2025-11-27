import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { MONDAY_APP_NAME } from '../constants';
import { callMondayAPI } from '../helpers/constants';
import { getMondayBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { getMondayGroupIdAllowedValues } from '../helpers/get-group-id-allowed-values';
import { getMondayRecordIdAllowedValues } from '../helpers/get-record-id-allowed-values';

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
  destination_group_id: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayGroupIdAllowedValues,
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

const MoveRecord = QoreAppCreator.createLocalizedAction({
  action: 'move_record',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,

  api_function: async (data, _opts, context) => {
    const { record_id, token, destination_group_id } = getQoreContextRequiredValues({
      context: {
        ...context,
        opts: data,
      },
      connectionFields: ['token'],
      optionFields: ['record_id', 'destination_group_id'],
    });

    const query = `
    mutation MoveItem($recordId: ID!, $destinationGroupId: String!) {
      move_item_to_group(item_id: $recordId, group_id: $destinationGroupId) {
        id
        name
      }
    }
  `;

    const response = await callMondayAPI<{
      data: { move_item_to_group: { id: string; name: string } };
    }>({
      query,
      variables: { recordId: record_id, destinationGroupId: destination_group_id },
      token,
    });

    return response.data?.move_item_to_group;
  },
  options,
  response_type,
});

export default MoveRecord;
