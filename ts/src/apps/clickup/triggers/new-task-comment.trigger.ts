import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { clickUpClient } from '../client';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { getClickUpFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';
import { getClickUpListIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import { getClickUpSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';
import { getClickUpTaskIdAllowedValues } from '../helpers/get-task-id-allowed-values';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';
import { clickUpCommentEventInfoType } from '../response-types';

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

    const webhook = await clickUpClient.post<{ id: string }>(
      `team/${workspace}/webhook`,
      {
        endpoint: url,
        ...(space && { space_id: space }),
        ...(folder && { folder_id: folder }),
        ...(list && { list_id: list }),
        ...(task && { task_id: task }),
        events: ['taskCommentPosted'],
      },
      { token }
    );

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

    await clickUpClient.delete(`webhook/${webhookId}`, { token });
  },
  format_event_data: async (context, eventData) => {
    const token = context.conn_opts?.token;
    const taskId = eventData.task_id;
    const commentId = eventData.history_items?.[0]?.comment?.id;

    if (!token || !taskId) {
      return eventData;
    }

    try {
      const commentsResponse = await clickUpClient.get<{ comments: any[] }>(
        `task/${taskId}/comment`,
        { token }
      );

      const comments = commentsResponse.comments || [];

      // Return the specific comment or the first one
      const comment = commentId
        ? comments.find((c: any) => c.id === commentId)
        : comments[0];

      return comment || eventData;
    } catch (error) {
      Debugger.log('Error fetching ClickUp comment:', error);
      return eventData;
    }
  },
  get_example_event_data: async (context) => {
    const mockData = {
      id: '648893191',
      comment: [{ text: 'Example comment', attributes: {} }],
      comment_text: 'Example comment',
      user: {
        id: 183,
        username: 'John',
        email: 'john@company.com',
        color: '#7b68ee',
        initials: 'J',
        profilePicture: null,
      },
      resolved: false,
      assignee: null,
      assigned_by: null,
      reactions: [],
      date: '1642737045116',
    };

    const token = context?.conn_opts?.token;
    const workspace = context?.opts?.workspace;

    if (!token || !workspace) {
      return mockData;
    }

    try {
      const spacesResponse = await clickUpClient.get<{ spaces: { id: string }[] }>(
        `team/${workspace}/space`,
        { token }
      );
      const spaces = spacesResponse.spaces || [];

      if (spaces.length === 0) {
        return mockData;
      }

      const space = spaces[0].id;

      const listsResponse = await clickUpClient.get<{ lists: { id: string }[] }>(
        `space/${space}/list`,
        { token }
      );
      const lists = listsResponse.lists || [];

      if (lists.length === 0) {
        return mockData;
      }

      const list = lists[0].id;

      const tasksResponse = await clickUpClient.get<{ tasks: { id: string }[] }>(
        `list/${list}/task`,
        { token }
      );
      const tasks = tasksResponse.tasks || [];

      if (tasks.length === 0) {
        return mockData;
      }

      const task = tasks[0].id;

      const commentsResponse = await clickUpClient.get<{ comments: any[] }>(
        `task/${task}/comment`,
        { token }
      );

      const comments = commentsResponse.comments || [];

      if (comments.length === 0) {
        return mockData;
      }

      return comments[0];
    } catch (error) {
      Debugger.log('Error fetching example event data:', error);
      return mockData;
    }
  },
  event_info: {
    desc: 'New task comment data',
    type: clickUpCommentEventInfoType,
  },
});

export default ClickUpNewTaskComment;
