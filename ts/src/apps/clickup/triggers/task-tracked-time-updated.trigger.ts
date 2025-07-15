import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { fetchClickUpData } from '../helpers/constants';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';

const options = {
  workspace: {
    type: 'string',
    required: true,
    get_allowed_values: getClickUpWorkspaceIdAllowedValues,
  },
} satisfies TQoreOptions;

const ClickUpTaskTimeTrackedUpdated = QoreAppCreator.createLocalizedTrigger<typeof options>({
  action: 'task_time_tracked_updated',
  app: CLICKUP_APP_NAME,
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options,
  webhook_register: async (context, url) => {
    const { token, workspace } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['workspace'],
      ErrorClass: ClickUpError,
    });

    const webhook = await fetchClickUpData<{ id: string }>({
      method: 'POST',
      token,
      body: {
        endpoint: url,
        events: ['taskTimeTrackedUpdated'],
      },
      path: `team/${workspace}/webhook`,
    });

    return { webhook };
  },
  webhook_deregister: async (context, _url, regInfo) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: ClickUpError,
    });

    const webhookId = regInfo.webhook.id;

    if (!webhookId) {
      throw new ClickUpError('Webhook ID is required for deregistration.');
    }

    await QorusRequest.deleteReq(
      {
        path: `/api/v2/webhook/${webhookId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      { endpointId: CLICKUP_APP_NAME, url: `https://api.clickup.com` }
    );
  },
  get_example_event_data: () => {
    return {
      event: 'taskTimeTrackedUpdated',
      history_items: [
        {
          id: '2800809188061123931',
          type: 1,
          date: '1642737376354',
          field: 'time_spent',
          parent_id: '162641285',
          data: {
            total_time: '900000',
            rollup_time: '900000',
          },
          source: null,
          user: {
            id: 183,
            username: 'John',
            email: 'john@company.com',
            color: '#7b68ee',
            initials: 'J',
            profilePicture: null,
          },
          before: null,
          after: {
            id: '2800809188061119507',
            start: '1642736476215',
            end: '1642737376215',
            time: '900000',
            source: 'clickup',
            date_added: '1642737376354',
          },
        },
      ],
      task_id: '1vj38vv',
      data: {
        description: 'Time Tracking Created',
        interval_id: '2800809188061119507',
      },
      webhook_id: '7fa3ec74-69a8-4530-a251-8a13730bd204',
    };
  },
  event_info: {
    desc: 'Updated task event data',
    type: {
      type: 'hash',
      fields: {
        event: { type: 'string' },
        history_items: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                id: { type: 'string' },
                type: { type: 'number' },
                date: { type: 'string' },
                field: { type: 'string' },
                parent_id: { type: 'string' },
                data: {
                  type: {
                    type: 'hash',
                    fields: {
                      total_time: { type: 'string' },
                      rollup_time: { type: 'string' },
                    },
                  },
                },
                source: { type: 'string' },
                user: {
                  type: {
                    type: 'hash',
                    fields: {
                      id: { type: 'number' },
                      username: { type: 'string' },
                      email: { type: 'string' },
                      color: { type: 'string' },
                      initials: { type: 'string' },
                      profilePicture: { type: 'string' },
                    },
                  },
                },
                before: { type: 'string' },
                after: {
                  type: {
                    type: 'hash',
                    fields: {
                      id: { type: 'string' },
                      start: { type: 'string' },
                      end: { type: 'string' },
                      time: { type: 'string' },
                      source: { type: 'string' },
                      date_added: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        task_id: { type: 'string' },
        data: {
          type: {
            type: 'hash',
            fields: {
              description: { type: 'string' },
              interval_id: { type: 'string' },
            },
          },
        },
        webhook_id: { type: 'string' },
      },
    },
  },
});

export default ClickUpTaskTimeTrackedUpdated;
