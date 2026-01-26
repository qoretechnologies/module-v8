import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getMondayBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { getMondayGroupIdAllowedValues } from '../helpers/get-group-id-allowed-values';
import { MONDAY_APP_NAME } from '../constants';
import { deregisterMondayWebhook, registerMondayWebhook } from './constants';

const options = {
  board_id: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayBoardIdAllowedValues,
  },
  group_id: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    depends_on: ['board_id'],
    get_allowed_values: getMondayGroupIdAllowedValues,
  },
} satisfies TQoreOptions;

const NewRecordMovedToGroup = QoreAppCreator.createLocalizedTrigger({
  app: MONDAY_APP_NAME,
  action: 'new_record_moved_to_group',
  action_code: EQoreAppActionCode.EVENT,
  options,
  webhook_register: (context, url) => {
    const token = context.conn_opts?.token;
    const boardId = context.opts?.board_id;
    const groupId = context.opts?.group_id;

    if (!token || !boardId || !groupId) {
      throw new Error(
        'The token, board_id, group_id are required to start the Monday new_record_moved_to_group trigger'
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
      variables,
    });
  },
  webhook_method: 'POST',
  webhook_echo_body_keys: ['challenge'],
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
                type: 'bool',
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
                      type: 'bool',
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

export default NewRecordMovedToGroup;
