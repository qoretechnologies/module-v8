import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getMondayBoardIdAllowedValues } from '../actions/helpers/get-board-id-allowed-values';
import { getMondayGroupIdAllowedValues } from '../actions/helpers/get-group-id-allowed-values';
import { MONDAY_APP_NAME } from '../constants';
import { deregisterMondayWebhook, registerMondayWebhook } from './constants';

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
  group_id: {
    display_name: 'Group ID',
    short_desc: 'The ID of the group to check for new records.',
    desc: 'The unique identifier of the group you want to check for new records in.',

    type: 'string',
    required: true,
    allowed_values_creatable: true,
    depends_on: ['board_id'],
    get_allowed_values: getMondayGroupIdAllowedValues,
  },
} satisfies TQoreOptions;

const mondayNewRecordMovedToGroupTrigger = QoreAppCreator.createTrigger({
  app: MONDAY_APP_NAME,
  action: 'new_record_moved_to_group',
  action_code: EQoreAppActionCode.EVENT,
  display_name: 'New Record Moved To Group',
  short_desc: 'Triggered when an item was moved to a group.',
  desc: 'Triggered when a new record is created.',
  options,
  webhook_register: (context, url) => {
    const token = context.conn_opts?.token;
    const apiUrl = context.conn_opts?.url;
    const boardId = context.opts?.board_id;
    const groupId = context.opts?.group_id;

    if (!token || !boardId || !groupId || !apiUrl) {
      throw new Error(
        'The token, board_id, group_id and url are required to start the Monday new_record_moved_to_group trigger'
      );
    }

    const variables = {
      boardId,
      url,
      config: JSON.stringify({ groupId }),
    };

    return registerMondayWebhook({
      event: 'item_moved_to_specific_group',
      token,
      apiUrl,
      variables,
    });
  },
  webhook_method: 'POST',
  webhook_deregister: deregisterMondayWebhook,
  event_info: {
    desc: 'Record Data',
    type: {
      type: 'hash',
      fields: {
        event: {
          type: {
            type: 'hash',
            fields: {
              app: {
                type: 'string',
              },
              type: {
                type: 'string',
              },
              triggerTime: {
                type: 'string',
              },
              subscriptionId: {
                type: 'number',
              },
              isRetry: {
                type: 'boolean',
              },
              userId: {
                type: 'number',
              },
              boardId: {
                type: 'number',
              },
              pulseId: {
                type: 'number',
              },
              sourceGroupId: {
                type: 'string',
              },
              destGroupId: {
                type: 'string',
              },
              destGroup: {
                type: {
                  type: 'hash',
                  fields: {
                    id: {
                      type: 'string',
                    },
                    title: {
                      type: 'string',
                    },
                    color: {
                      type: 'string',
                    },
                    is_top_group: {
                      type: 'boolean',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export default mondayNewRecordMovedToGroupTrigger;
