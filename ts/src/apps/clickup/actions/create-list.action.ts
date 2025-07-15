import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { fetchClickUpData } from '../helpers/constants';
import { getClickUpFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';
import { getClickUpSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';
import { getClickUpWorkspaceMemberIdAllowedValues } from '../helpers/get-workspace-member-id-allowed-values';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';

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
    required: true,
    preselected: true,
    depends_on: ['space'],
    get_allowed_values: getClickUpFolderIdAllowedValues,
  },

  name: {
    type: 'string',
    required: true,
  },
  content: {
    type: 'string',
    required: false,
    preselected: true,
  },
  assignee: {
    type: 'number',
    get_allowed_values: getClickUpWorkspaceMemberIdAllowedValues,
    allowed_values_creatable: true,
  },

  priority: {
    type: 'integer',
    required: false,
  },
  due_date: {
    type: 'date',
    required: false,
  },

  markdown_content: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const createList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLICKUP_APP_NAME,
  action: 'create_list',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, folder, name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['folder', 'name'],
      ErrorClass: ClickUpError,
    });

    const { due_date, content, priority, markdown_content, assignee } = obj || {};

    const dueDateTime = due_date ? new Date(due_date).getTime() : undefined;

    try {
      return await fetchClickUpData({
        token,
        method: 'POST',
        body: {
          name,
          ...(content && { content }),
          ...(assignee && { assignee }),
          ...(priority && { priority }),
          ...(dueDateTime && { due_date: dueDateTime }),
          ...(markdown_content && { markdown_content }),
        },
        path: `folder/${folder}/list`,
      });
    } catch (error) {
      throw new ClickUpError(`Failed to create a list: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' },
      orderindex: { type: 'number' },
      content: { type: 'string' },
      status: {
        type: {
          type: 'hash',
          fields: {
            status: { type: 'string' },
            color: { type: 'string' },
            hide_label: { type: 'boolean' },
          },
        },
      },
      priority: {
        type: {
          type: 'hash',
          fields: {
            priority: { type: 'string' },
            color: { type: 'string' },
          },
        },
      },
      assignee: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'number' },
            color: { type: 'string' },
            username: { type: 'string' },
            initials: { type: 'string' },
            profilePicture: { type: 'string' },
          },
        },
      },
      task_count: { type: 'string' },
      due_date: { type: 'string' },
      due_date_time: { type: 'boolean' },
      start_date: { type: 'string' },
      start_date_time: { type: 'string' },
      folder: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            name: { type: 'string' },
            hidden: { type: 'boolean' },
            access: { type: 'boolean' },
          },
        },
      },
      space: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            name: { type: 'string' },
            access: { type: 'boolean' },
          },
        },
      },
      statuses: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              status: { type: 'string' },
              orderindex: { type: 'number' },
              color: { type: 'string' },
              type: { type: 'string' },
            },
          },
        },
      },
      inbound_address: { type: 'string' },
    },
  },
});

export default createList;
