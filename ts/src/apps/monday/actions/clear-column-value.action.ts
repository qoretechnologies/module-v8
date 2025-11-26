import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { MONDAY_APP_NAME, MondayError } from '../constants';
import { callMondayAPI } from '../helpers/constants';
import { getMondayBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { getMondayColumnIdAllowedValues } from '../helpers/get-column-id-allowed-values';
import { getMondayRecordIdAllowedValues } from '../helpers/get-record-id-allowed-values';

const options = {
  board_id: {
    type: 'string',
    required: true,
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
  column_id: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayColumnIdAllowedValues,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    record_id: {
      type: 'string',
    },
    column_id: {
      type: 'string',
    },
  },
} satisfies TQoreResponseType;

const ClearColumnValue = QoreAppCreator.createLocalizedAction({
  action: 'clear_column_value',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,

  api_function: async (data, _opts, context) => {
    const { token, record_id, column_id, board_id } = getQoreContextRequiredValues({
      context: {
        ...context,
        opts: data,
      },
      connectionFields: ['token'],
      optionFields: ['record_id', 'column_id', 'board_id'],
    });

    const query = `
      mutation ClearColumnValue($boardId: ID!, $recordId: ID!, $columnId: String!) {
        change_column_value(item_id: $recordId, column_id: $columnId, board_id: $boardId, value: "{}") {
          id
        }
      }
      `;

    const response = await callMondayAPI<{ errors?: { message: string }[] }>({
      query,
      variables: { recordId: record_id, columnId: column_id, boardId: board_id },
      token,
    });

    if (response.errors && response.errors.length > 0) {
      const errorMessages = response.errors.map((err) => err.message).join('; ');
      throw new MondayError(`Failed to clear column value: ${errorMessages}`);
    }

    return {
      record_id,
      column_id,
    };
  },
  options,
  response_type,
});

export default ClearColumnValue;
