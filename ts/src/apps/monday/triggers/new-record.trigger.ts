import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getMondayBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { MONDAY_APP_NAME, MondayError } from '../constants';
import { getMondayBoardItems } from './constants';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { getMondayGroupIdAllowedValues } from '../helpers/get-group-id-allowed-values';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { getMondayBoardFieldsResponseType } from '../helpers/get-board-fields';

const options = {
  board_id: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayBoardIdAllowedValues,
  },
  group_id: {
    type: 'string',
    depends_on: ['board_id'],
    required: false,
    get_allowed_values: getMondayGroupIdAllowedValues,
  },
} satisfies TQoreOptions;

const NewRecord = QoreAppCreator.createLocalizedTrigger({
  app: MONDAY_APP_NAME,
  action: 'new_record',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, board_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['board_id'],
      ErrorClass: MondayError,
    });
    const groupId = context?.opts?.group_id;

    const getRecords = () => {
      return getMondayBoardItems({
        token,
        boardId: board_id,
        limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
        orderBy: 'created_at',
        orderDirection: 'desc',
        groupId,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'monday_new_record_trigger',
      uniqueField: 'id',
      getItems: getRecords,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, board_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['board_id'],
      ErrorClass: MondayError,
    });

    const groupId = context?.opts?.group_id;

    const records = await getMondayBoardItems({
      token,
      boardId: board_id,
      limit: 1,
      orderBy: 'created_at',
      orderDirection: 'desc',
      groupId,
    });

    return records?.length ? records[0] : null;
  },
  event_info: {
    desc: 'Record Data',
    type: {
      type: 'hash',
      fields: {
        id: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        created_at: {
          type: 'string',
        },
        updated_at: {
          type: 'string',
        },
      },
    },
  },
  get_dynamic_type: getMondayBoardFieldsResponseType,
});

export default NewRecord;
