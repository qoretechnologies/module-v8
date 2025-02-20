import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { getMondayBoardIdAllowedValues } from '../actions/helpers/get-board-id-allowed-values';
import { MONDAY_APP_NAME } from '../constants';
import { getMondayBoardItems } from './constants';

const options = {
  board_id: {
    display_name: 'Board ID',
    short_desc: 'The ID of the board to check for new records.',
    desc: 'The unique identifier of the board that should be checked for new records.',

    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayBoardIdAllowedValues,
  },
} satisfies TQoreOptions;

const mondayNewRecordTrigger = QoreAppCreator.createTrigger({
  app: MONDAY_APP_NAME,
  action: 'new_record',
  action_code: EQoreAppActionCode.EVENT,
  display_name: 'New Record',
  short_desc: 'Triggered when a new item is created.',
  desc: 'Triggered when a new record is created.',
  options,
  event_function: async (context, update, should_stop) => {
    const boardId = context.opts?.board_id;
    const token = context.conn_opts?.token;
    const url = context.conn_opts?.url;

    if (!token || !boardId || !url) {
      throw new Error(
        'The token, board_id and url are required to start the Monday new_record trigger'
      );
    }

    const getRecords = () => {
      return getMondayBoardItems({
        token,
        url,
        boardId,
        limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
        orderBy: 'created_at',
        orderDirection: 'desc',
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
});

export default mondayNewRecordTrigger;
