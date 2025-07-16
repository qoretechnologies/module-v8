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

const ClickUpNewTask = QoreAppCreator.createLocalizedTrigger<typeof options>({
  action: 'new_task',
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
        events: ['taskCreated'],
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
      event: 'taskCreated',
      history_items: [
        {
          id: '2800763136717140857',
          type: 1,
          date: '1642734631523',
          field: 'status',
          parent_id: '162641062',
          data: {
            status_type: 'open',
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
          before: {
            status: null,
            color: '#000000',
            type: 'removed',
            orderindex: -1,
          },
          after: {
            status: 'to do',
            color: '#f9d900',
            orderindex: 0,
            type: 'open',
          },
        },
        {
          id: '2800763136700363640',
          type: 1,
          date: '1642734631523',
          field: 'task_creation',
          parent_id: '162641062',
          data: {},
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
          after: null,
        },
      ],
      task_id: '1vj37mc',
      webhook_id: '7fa3ec74-69a8-4530-a251-8a13730bd204',
    };
  },
  event_info: {
    desc: '',
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
                data: { type: 'hash' },
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
                before: {
                  type: {
                    type: 'hash',
                    fields: {
                      status: { type: 'string' },
                      color: { type: 'string' },
                      type: { type: 'string' },
                      orderindex: { type: 'number' },
                    },
                  },
                },
                after: {
                  type: {
                    type: 'hash',
                    fields: {
                      status: { type: 'string' },
                      color: { type: 'string' },
                      orderindex: { type: 'number' },
                      type: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        task_id: { type: 'string' },
        webhook_id: { type: 'string' },
      },
    },
  },
});

export default ClickUpNewTask;
