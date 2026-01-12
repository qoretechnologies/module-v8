import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { map } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { clickUpClient } from '../client';
import { getClickUpFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';
import { getClickUpListIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import { getClickUpSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';

const options = {
  workspace: {
    type: 'string',
    required: false,
    preselected: true,
    get_allowed_values: getClickUpWorkspaceIdAllowedValues,
    on_change: ['refetch'],
  },
  space: {
    type: 'string',
    required: false,
    preselected: true,
    get_allowed_values: getClickUpSpaceIdAllowedValues,
    depends_on: ['workspace'],
    on_change: ['refetch'],
  },
  folder: {
    type: 'string',
    required: false,
    preselected: true,
    depends_on: ['space'],
    get_allowed_values: getClickUpFolderIdAllowedValues,
  },
  list: {
    type: 'string',
    required: true,
    get_allowed_values: getClickUpListIdAllowedValues,
  },
  archived: {
    type: 'bool',
    required: false,
  },
  include_markdown_description: {
    type: 'bool',
    required: false,
  },
  page: {
    type: 'integer',
    required: false,
  },
  order_by: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'created', display_name: 'Created' },
      { value: 'updated', display_name: 'Updated' },
      { value: 'due_date', display_name: 'Due Date' },
      { value: 'id', display_name: 'ID' },
    ],
  },
  reverse: {
    type: 'bool',
    required: false,
  },
  subtasks: {
    type: 'bool',
    required: false,
  },
  include_closed: {
    type: 'bool',
    required: false,
  },
  status: {
    type: {
      type: 'list',
      element_type: 'string',
    },
  },
} satisfies TQoreOptions;

const listTasks = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLICKUP_APP_NAME,
  action: 'list_tasks',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, list } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['list'],
      ErrorClass: ClickUpError,
    });

    const {
      archived,
      include_markdown_description,
      page = 0,
      order_by,
      reverse,
      subtasks,
      include_closed,
      status = [],
    } = obj || {};

    const statuses = map(status, (val) => `status=${encodeURIComponent(val)}`).join('&');

    try {
      return await clickUpClient.get(`list/${list}/task`, {
        token,
        params: {
          archived: archived === true ? 'true' : 'false',
          include_markdown_description: include_markdown_description === true ? 'true' : 'false',
          subtasks: subtasks === true ? 'true' : 'false',
          include_closed: include_closed === true ? 'true' : 'false',
          page: page.toString(),
          ...(order_by && { order_by }),
          ...(reverse && { reverse: reverse === true ? 'true' : 'false' }),
          ...(statuses?.length && { statuses }),
        },
      });
    } catch (error) {
      throw new ClickUpError(`Failed to list tasks: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      tasks: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
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
                  element_type: 'any',
                },
              },
              watchers: {
                type: {
                  type: 'list',
                  element_type: 'any',
                },
              },
              checklists: {
                type: {
                  type: 'list',
                  element_type: 'any',
                },
              },
              tags: {
                type: {
                  type: 'list',
                  element_type: 'any',
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
              time_estimate: { type: 'string' },
              points: { type: 'number' },
              time_spent: { type: 'string' },
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
        },
      },
      last_page: { type: 'bool' },
    },
  },
});

export default listTasks;
