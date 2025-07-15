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
import { getClickUpSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';
import { getClickUpFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';
import { getClickUpListIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import { getClickUpTaskIdAllowedValues } from '../helpers/get-task-id-allowed-values';

const options = {
  workspace: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    get_allowed_values: getClickUpWorkspaceIdAllowedValues,
  },
  space: {
    type: 'string',
    required: false,
    preselected: true,
    get_allowed_values: getClickUpSpaceIdAllowedValues,
    on_change: ['refetch'],
    depends_on: ['workspace'],
  },
  folder: {
    type: 'string',
    required: false,
    preselected: true,
    depends_on: ['space'],
    on_change: ['refetch'],
    get_allowed_values: getClickUpFolderIdAllowedValues,
  },
  list: {
    type: 'string',
    required: false,
    preselected: true,
    on_change: ['refetch'],
    get_allowed_values: getClickUpListIdAllowedValues,
  },
  task: {
    type: 'string',
    required: false,
    preselected: true,
    get_allowed_values: getClickUpTaskIdAllowedValues,
  },
} satisfies TQoreOptions;

const ClickUpNewTaskComment = QoreAppCreator.createLocalizedTrigger<typeof options>({
  action: 'new_task_comment',
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

    const { space, folder, list, task } = context.opts || {};

    const webhook = await fetchClickUpData<{ id: string }>({
      method: 'POST',
      token,
      body: {
        endpoint: url,
        ...(space && { space_id: space }),
        ...(folder && { folder_id: folder }),
        ...(list && { list_id: list }),
        ...(task && { task_id: task }),
        events: ['taskCommentPosted'],
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
      event: 'taskCommentPosted',
      history_items: [
        {
          id: '2800803631413624919',
          type: 1,
          date: '1642737045116',
          field: 'comment',
          parent_id: '162641285',
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
          after: '648893191',
          comment: {
            id: '648893191',
            date: '1642737045116',
            parent: '1vj38vv',
            type: 1,
            comment: [
              {
                text: 'comment abc1234',
                attributes: {},
              },
              {
                text: '\n',
                attributes: {
                  'block-id': 'block-4c8fe54f-7bff-4b7b-92a2-9142068983ea',
                },
              },
            ],
            text_content: 'comment abc1234\n',
            x: null,
            y: null,
            image_y: null,
            image_x: null,
            page: null,
            comment_number: null,
            page_id: null,
            page_name: null,
            view_id: null,
            view_name: null,
            team: null,
            user: {
              id: 183,
              username: 'John',
              email: 'john@company.com',
              color: '#7b68ee',
              initials: 'J',
              profilePicture: null,
            },
            new_thread_count: 0,
            new_mentioned_thread_count: 0,
            email_attachments: [],
            threaded_users: [],
            threaded_replies: 0,
            threaded_assignees: 0,
            threaded_assignees_members: [],
            threaded_unresolved_count: 0,
            thread_followers: [
              {
                id: 183,
                username: 'John',
                email: 'john@company.com',
                color: '#7b68ee',
                initials: 'J',
                profilePicture: null,
              },
            ],
            group_thread_followers: [],
            reactions: [],
            emails: [],
          },
        },
      ],
      task_id: '1vj38vv',
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
                before: { type: 'string' },
                after: { type: 'string' },
                comment: {
                  type: {
                    type: 'hash',
                    fields: {
                      id: { type: 'string' },
                      date: { type: 'string' },
                      parent: { type: 'string' },
                      type: { type: 'number' },
                      comment: {
                        type: {
                          type: 'list',
                          element_type: {
                            type: 'hash',
                            fields: {
                              text: { type: 'string' },
                              attributes: { type: 'hash' },
                            },
                          },
                        },
                      },
                      text_content: { type: 'string' },
                      x: { type: 'string' },
                      y: { type: 'string' },
                      image_y: { type: 'string' },
                      image_x: { type: 'string' },
                      page: { type: 'string' },
                      comment_number: { type: 'string' },
                      page_id: { type: 'string' },
                      page_name: { type: 'string' },
                      view_id: { type: 'string' },
                      view_name: { type: 'string' },
                      team: { type: 'string' },
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
                      new_thread_count: { type: 'number' },
                      new_mentioned_thread_count: { type: 'number' },
                      email_attachments: {
                        type: {
                          type: 'list',
                          element_type: 'hash',
                        },
                      },
                      threaded_users: {
                        type: {
                          type: 'list',
                          element_type: 'hash',
                        },
                      },
                      threaded_replies: { type: 'number' },
                      threaded_assignees: { type: 'number' },
                      threaded_assignees_members: {
                        type: {
                          type: 'list',
                          element_type: 'hash',
                        },
                      },
                      threaded_unresolved_count: { type: 'number' },
                      thread_followers: {
                        type: {
                          type: 'list',
                          element_type: {
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
                      },
                      group_thread_followers: {
                        type: {
                          type: 'list',
                          element_type: 'hash',
                        },
                      },
                      reactions: {
                        type: {
                          type: 'list',
                          element_type: 'hash',
                        },
                      },
                      emails: {
                        type: {
                          type: 'list',
                          element_type: 'hash',
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

export default ClickUpNewTaskComment;
