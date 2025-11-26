import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { MONDAY_APP_NAME } from '../constants';
import { formatMondayRecords } from '../helpers/constants';
import { getMondayBoardDependentOptions } from '../helpers/get-board-fields';
import { getMondayBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { getMondayRecordIdAllowedValues } from '../helpers/get-record-id-allowed-values';
import { batchUpdateMondayItems } from '../helpers/record-based/update-records';

const options = {
  board_id: {
    type: 'string',
    required: true,
    preselected: true,
    on_change: ['refetch'],
    allowed_values_creatable: true,
    get_allowed_values: getMondayBoardIdAllowedValues,
    get_dependent_options: getMondayBoardDependentOptions,
  },
  record_id: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayRecordIdAllowedValues,
  },
} satisfies TQoreOptions;

const additionalOptions = {
  column_values: {
    depends_on: ['board_id'],
    type: 'hash',
    required: true,
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

const UpdateRecord = QoreAppCreator.createLocalizedAction<
  Partial<typeof additionalOptions> & typeof options
>({
  action: 'update_record',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,

  api_function: async (data, _opts, context) => {
    const { token, record_id, column_values, board_id } = getQoreContextRequiredValues({
      context: {
        ...context,
        opts: data,
      },
      optionFields: ['record_id', 'board_id', 'column_values'],
      connectionFields: ['token'],
    });

    const formattedFields = await formatMondayRecords({
      records: [column_values],
      token,
      boardId: board_id,
    });

    const formattedColumnValues = JSON.stringify(formattedFields[0]);

    const records = await batchUpdateMondayItems(
      token,
      board_id,
      [record_id],
      formattedColumnValues
    );

    return records[0];
  },
  options,
  response_type,
});

export default UpdateRecord;
