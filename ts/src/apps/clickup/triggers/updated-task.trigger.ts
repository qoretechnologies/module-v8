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

const ClickUpTaskUpdated = QoreAppCreator.createLocalizedTrigger<typeof options>({
  action: 'task_updated',
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
        events: ['taskUpdated'],
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
    // Webhook data strongly depends on the changes made to the task.
    // This is a generic example of what the data might look like.
    // Fetching real data would require making at least four API calls, which will overwhelm the limits
    return {
      event: 'taskUpdated',
      history_items: [
        {
          id: '2800768061568222238',
          type: 1,
          date: '1642734925064',
          field: 'assignee_add',
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
          after: {
            id: 212567236,
            username: 'John',
            email: 'john@company.com',
            color: '',
            initials: 'J',
            profilePicture: 'https://attachments.clickup.com/profilePictures/212567236_4mG.jpg',
          },
        },
      ],
      task_id: '1vj37mc',
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
                      role: { type: 'number' },
                      role_subtype: { type: 'number' },
                    },
                  },
                },
                after: { type: 'any' },
                before: { type: 'any' },
                custom_field: {
                  type: {
                    type: 'hash',
                    fields: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      type: { type: 'string' },
                      type_config: {
                        type: {
                          type: 'hash',
                          fields: {
                            default: { type: 'any' },
                            placeholder: { type: 'string' },
                            new_drop_down: { type: 'boolean' },
                            options: {
                              type: {
                                type: 'list',
                                element_type: {
                                  type: 'hash',
                                  fields: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    color: { type: 'string' },
                                    orderindex: { type: 'number' },
                                    type: { type: 'string' },
                                    value: { type: 'any' },
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

export default ClickUpTaskUpdated;
