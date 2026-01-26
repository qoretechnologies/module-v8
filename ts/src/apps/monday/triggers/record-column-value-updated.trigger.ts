import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getMondayBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { getMondayColumnIdAllowedValues } from '../helpers/get-column-id-allowed-values';
import { MONDAY_APP_NAME } from '../constants';
import { deregisterMondayWebhook, registerMondayWebhook } from './constants';

const options = {
  board_id: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayBoardIdAllowedValues,
  },
  column_id: {
    type: 'string',
    depends_on: ['board_id'],
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayColumnIdAllowedValues,
  },
} satisfies TQoreOptions;

const RecordColumnValueUpdated = QoreAppCreator.createLocalizedTrigger({
  app: MONDAY_APP_NAME,
  action: 'record_column_value_updated',
  action_code: EQoreAppActionCode.EVENT,
  options,
  webhook_register: (context, url) => {
    const token = context.conn_opts?.token;
    const boardId = context.opts?.board_id;
    const columnId = context.opts?.column_id;

    if (!token || !boardId || !columnId) {
      throw new Error(
        'The token, board_id, column_id are required to start the Monday record_column_value_updated trigger'
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
              app: { type: 'string' },
              type: { type: 'string' },
              triggerTime: { type: 'string' },
              subscriptionId: { type: 'number' },
              isRetry: { type: 'bool' },
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
                          is_done: { type: 'bool' },
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
                          is_done: { type: 'bool' },
                        },
                      },
                    },
                    post_id: { type: 'string' },
                  },
                },
              },
              changedAt: { type: 'number' },
              isTopGroup: { type: 'bool' },
              triggerUuid: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default RecordColumnValueUpdated;
