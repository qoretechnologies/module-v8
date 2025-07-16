import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { fetchClickUpData } from '../helpers/constants';
import { getClickUpFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';
import { getClickUpGroupIdAllowedValues } from '../helpers/get-group-id-allowed-values';
import { getClickUpListIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import { getClickUpSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';
import { getClickUpTaskIdAllowedValues } from '../helpers/get-task-id-allowed-values';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';
import { getClickUpWorkspaceMemberIdAllowedValues } from '../helpers/get-workspace-member-id-allowed-values';

const options = {
  workspace: {
    type: 'string',
    required: false,
    preselected: true,
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
    required: true,
    get_allowed_values: getClickUpTaskIdAllowedValues,
  },
  comment_text: {
    required: true,
    type: 'string',
  },
  notify_all: {
    type: 'boolean',
    required: true,
  },
  assignee: {
    type: 'number',
    required: false,
    get_allowed_values: getClickUpWorkspaceMemberIdAllowedValues,
  },
  group_assignee: {
    type: 'string',
    required: false,
    get_allowed_values: getClickUpGroupIdAllowedValues,
  },
} satisfies TQoreOptions;

const createTaskComment = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLICKUP_APP_NAME,
  action: 'create_task_comment',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, task, notify_all, comment_text } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['task', 'notify_all', 'comment_text'],
      ErrorClass: ClickUpError,
    });

    const { assignee, group_assignee } = obj || {};

    try {
      return await fetchClickUpData({
        token,
        method: 'POST',
        body: {
          comment_text,
          notify_all,
          ...(assignee && { assignee }),
          ...(group_assignee && { group_assignee }),
        },
        path: `task/${task}/comment`,
      });
    } catch (error) {
      throw new ClickUpError(`Failed to create task comment: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: {
        type: 'string',
      },
      hist_id: {
        type: 'string',
      },
      date: {
        type: 'number',
      },
    },
  },
});

export default createTaskComment;
