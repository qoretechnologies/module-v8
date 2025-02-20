import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollUpdatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { getMondayBoardIdAllowedValues } from '../actions/helpers/get-board-id-allowed-values';
import { MONDAY_APP_NAME } from '../constants';
import { getMondayBoardItems } from './constants';

const options = {
  board_id: {
    display_name: 'Board ID',
    short_desc: 'The ID of the board to check for updated records.',
    desc: 'The unique identifier of the board that should be checked for updated records.',

    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayBoardIdAllowedValues,
  },
} satisfies TQoreOptions;

const mondayUpdatedRecordTrigger = QoreAppCreator.createTrigger({
  app: MONDAY_APP_NAME,
  action: 'updated_record',
  action_code: EQoreAppActionCode.EVENT,
  display_name: 'Updated Record',
  short_desc: 'Triggered when an item is updated.',
  desc: 'Triggered when an item on the board is updated.',
  options,
  event_function: async (context, update, should_stop) => {
    const boardId = context.opts?.board_id;
    const token = context.conn_opts?.token;
    const url = context.conn_opts?.url;

    if (!token || !boardId || !url) {
      throw new Error(
        'The token, board_id and url are required to start the Monday updated_record trigger'
      );
    }

    const getRecords = () => {
      return getMondayBoardItems({
        token,
        url,
        boardId,
        limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
        orderBy: 'updated_at',
        orderDirection: 'desc',
      });
    };

    await pollUpdatedItemsForTrigger({
      trigger_name: 'monday_updated_record_trigger',
      uniqueField: 'id',
      updatedDateField: 'updated_at',
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

export default mondayUpdatedRecordTrigger;
