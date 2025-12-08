import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { fetchClickUpData } from '../helpers/constants';
import { getClickUpFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';
import { getClickUpGroupIdAllowedValues } from '../helpers/get-group-id-allowed-values';
import { getClickUpListIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import { getClickUpSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';
import { getClickUpTaskIdAllowedValues } from '../helpers/get-task-id-allowed-values';
import { getClickUpTaskTypeAllowedValues } from '../helpers/get-task-type-allowed-values';
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
    required: false,
    preselected: true,
    depends_on: ['space'],
    on_change: ['refetch'],
    get_allowed_values: getClickUpFolderIdAllowedValues,
  },
  list: {
    type: 'string',
    required: true,
    get_allowed_values: getClickUpListIdAllowedValues,
  },

  name: {
    type: 'string',
    required: true,
  },
  description: {
    type: 'string',
    required: false,
    preselected: true,
  },
  assignees: {
    type: {
      type: 'list',
      element_type: 'number',
    },
    get_element_allowed_values: getClickUpWorkspaceMemberIdAllowedValues,
    element_allowed_values_creatable: true,
  },
  archived: {
    required: false,
    type: 'bool',
  },
  group_assignees: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getClickUpGroupIdAllowedValues,
    element_allowed_values_creatable: true,
  },
  tags: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
  priority: {
    type: 'integer',
    required: false,
  },
  due_date: {
    type: 'date',
    required: false,
  },
  start_date: {
    type: 'date',
    required: false,
  },
  time_estimate: {
    type: 'integer',
    required: false,
  },
  points: {
    type: 'number',
    required: false,
  },
  notify_all: {
    type: 'bool',
    required: false,
  },
  parent: {
    type: 'string',
    required: false,
    get_allowed_values: getClickUpTaskIdAllowedValues,
  },
  markdown_content: {
    type: 'string',
    required: false,
  },
  links_to: {
    type: 'string',
    required: false,
    get_allowed_values: getClickUpTaskIdAllowedValues,
  },
  check_required_custom_fields: {
    type: 'bool',
    required: false,
  },
  custom_fields: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          value: { type: 'any' },
        },
      },
    },
  },
  custom_item_id: {
    required: false,
    type: 'number',
    get_allowed_values: getClickUpTaskTypeAllowedValues,
  },
} satisfies TQoreOptions;

const createTask = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLICKUP_APP_NAME,
  action: 'create_task',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, list, name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['list', 'name'],
      ErrorClass: ClickUpError,
    });

    const {
      due_date,
      start_date,
      description,
      assignees,
      archived,
      group_assignees,
      tags,
      priority,
      time_estimate,
      points,
      notify_all,
      parent,
      markdown_content,
      links_to,
      check_required_custom_fields,
      custom_fields,
      custom_item_id,
    } = obj || {};

    const dueDateTime = due_date ? new Date(due_date).getTime() : undefined;
    const startDateTime = start_date ? new Date(start_date).getTime() : undefined;

    try {
      return await fetchClickUpData({
        token,
        method: 'POST',
        body: {
          name,
          ...(description && { description }),
          ...(assignees?.length && { assignees }),
          ...(group_assignees?.length && { group_assignees }),
          ...(tags?.length && { tags }),
          ...(priority && { priority }),
          ...(dueDateTime && { due_date: dueDateTime }),
          ...(startDateTime && { start_date: startDateTime }),
          ...(time_estimate && { time_estimate }),
          ...(points && { points }),
          ...(notify_all && { notify_all }),
          ...(parent && { parent }),
          ...(markdown_content && { markdown_content }),
          ...(links_to && { links_to }),
          ...(check_required_custom_fields && { check_required_custom_fields }),
          ...(custom_fields && { custom_fields }),
          ...(custom_item_id && { custom_item_id }),
          ...(archived && { archived }),
        },
        path: `list/${list}/task`,
      });
    } catch (error) {
      throw new ClickUpError(`Failed to create task: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      custom_id: { type: 'string' },
      custom_item_id: { type: 'string' },
      name: { type: 'string' },
      text_content: { type: 'string' },
      description: { type: 'string' },
      markdown_description: { type: 'string' },
      status: {
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
      orderindex: { type: 'string' },
      date_created: { type: 'string' },
      date_updated: { type: 'string' },
      date_closed: { type: 'string' },
      date_done: { type: 'string' },
      creator: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'number' },
            username: { type: 'string' },
            color: { type: 'string' },
            profilePicture: { type: 'string' },
          },
        },
      },
      assignees: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
      archived: { type: 'bool' },
      group_assignees: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
      email_assignees: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
      checklists: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
      tags: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
      parent: { type: 'string' },
      priority: {
        type: {
          type: 'hash',
          fields: {
            color: { type: 'string' },
            id: { type: 'string' },
            orderindex: { type: 'string' },
            priority: { type: 'string' },
          },
        },
      },
      due_date: { type: 'string' },
      start_date: { type: 'string' },
      points: { type: 'number' },
      time_estimate: { type: 'string' },
      time_spent: { type: 'string' },
      custom_fields: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              type_config: { type: 'hash' },
              date_created: { type: 'string' },
              hide_from_guests: { type: 'bool' },
              value: { type: 'hash' },
              required: { type: 'bool' },
            },
          },
        },
      },
      list: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
          },
        },
      },
      folder: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
          },
        },
      },
      space: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
          },
        },
      },
      url: { type: 'string' },
    },
  },
});

export default createTask;
