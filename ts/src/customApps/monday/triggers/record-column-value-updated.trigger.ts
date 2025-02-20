import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getMondayBoardIdAllowedValues } from '../actions/helpers/get-board-id-allowed-values';
import { getMondayColumnIdAllowedValues } from '../actions/helpers/get-column-id-allowed-values';
import { MONDAY_APP_NAME } from '../constants';
import { deregisterMondayWebhook, registerMondayWebhook } from './constants';

const options = {
  board_id: {
    display_name: 'Board ID',
    short_desc: 'The ID of the board to check for record field updates.',
    desc: 'The unique identifier of the board that should be checked for record field updates.',

    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayBoardIdAllowedValues,
  },
  column_id: {
    display_name: 'Column ID',
    short_desc: 'The ID of the column to check for new value.',
    desc: 'The unique identifier of the column that should be checked for new value.',

    type: 'string',
    depends_on: ['board_id'],
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayColumnIdAllowedValues,
  },
} satisfies TQoreOptions;

const mondayRecordColumnValueUpdatedTrigger = QoreAppCreator.createTrigger({
  app: MONDAY_APP_NAME,
  action: 'record_column_value_updated',
  action_code: EQoreAppActionCode.EVENT,
  display_name: 'Record Column Value Updated',
  short_desc: 'Triggered when a record column value is updated.',
  desc: 'Triggered when a record column value is updated.',
  options,
  webhook_register: (context, url) => {
    const token = context.conn_opts?.token;
    const apiUrl = context.conn_opts?.url;
    const boardId = context.opts?.board_id;
    const columnId = context.opts?.column_id;

    if (!token || !boardId || !columnId || !apiUrl) {
      throw new Error(
        'The token, board_id, column_id and url are required to start the Monday record_column_value_updated trigger'
      );
    }

    const variables = {
      boardId,
      url,
      config: JSON.stringify({ columnId }),
    };

    return registerMondayWebhook({
      event: 'change_specific_column_value',
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
              app: { type: 'string' },
              type: { type: 'string' },
              triggerTime: { type: 'string' },
              subscriptionId: { type: 'number' },
              isRetry: { type: 'boolean' },
              userId: { type: 'number' },
              originalTriggerUuid: { type: 'string' },
              boardId: { type: 'number' },
              groupId: { type: 'string' },
              pulseId: { type: 'number' },
              pulseName: { type: 'string' },
              columnId: { type: 'string' },
              columnType: { type: 'string' },
              columnTitle: { type: 'string' },
              value: {
                type: {
                  type: 'hash',
                  fields: {
                    label: {
                      type: {
                        type: 'hash',
                        fields: {
                          index: { type: 'number' },
                          text: { type: 'string' },
                          style: {
                            type: {
                              type: 'hash',
                              fields: {
                                color: { type: 'string' },
                                border: { type: 'string' },
                                var_name: { type: 'string' },
                              },
                            },
                          },
                          is_done: { type: 'boolean' },
                        },
                      },
                    },
                    post_id: { type: 'string' },
                  },
                },
              },
              previousValue: {
                type: {
                  type: 'hash',
                  fields: {
                    label: {
                      type: {
                        type: 'hash',
                        fields: {
                          index: { type: 'number' },
                          text: { type: 'string' },
                          style: {
                            type: {
                              type: 'hash',
                              fields: {
                                color: { type: 'string' },
                                border: { type: 'string' },
                                var_name: { type: 'string' },
                              },
                            },
                          },
                          is_done: { type: 'boolean' },
                        },
                      },
                    },
                    post_id: { type: 'string' },
                  },
                },
              },
              changedAt: { type: 'number' },
              isTopGroup: { type: 'boolean' },
              triggerUuid: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default mondayRecordColumnValueUpdatedTrigger;
