import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { MONDAY_APP_NAME } from '../constants';
import {
  batchCreateMondayItems,
  formatMondayRecordResponse,
  formatMondayRecords,
} from '../helpers/constants';
import {
  getMondayBoardDependentOptions,
  getMondayBoardFieldsResponseType,
} from '../helpers/get-board-fields';
import { getMondayBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { getMondayGroupIdAllowedValues } from '../helpers/get-group-id-allowed-values';

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
  group_id: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    get_allowed_values: getMondayGroupIdAllowedValues,
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
    updated_at: {
      type: 'string',
    },
    created_at: {
      type: 'string',
    },
  },
} satisfies TQoreResponseType;

const CreateRecord = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof additionalOptions>
>({
  action: 'create_record',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,

  api_function: async (data, _opts, context) => {
    const { token, board_id, column_values } = getQoreContextRequiredValues({
      context: {
        ...context,
        opts: data,
      },
      connectionFields: ['token'],
      optionFields: ['board_id', 'column_values'],
    });

    const groupId = data?.group_id;

    const formattedRecords = (
      await formatMondayRecords({
        records: [column_values],
        boardId: board_id,
        token,
      })
    ).map((record) => ({
      board_id,
      item_name: (record['name'] || 'New Item') as string,
      column_values: omit(record, ['name']),
    }));

    const items = await batchCreateMondayItems(formattedRecords, token, groupId);

    const formattedItems = formatMondayRecordResponse(items);

    return formattedItems[0];
  },
  options,
  response_type,
  get_dynamic_response_type: getMondayBoardFieldsResponseType,
});

export default CreateRecord;
