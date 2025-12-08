import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { fetchClickUpData } from '../helpers/constants';
import { getClickUpSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';
import { getClickUpFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';

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
    depends_on: ['workspace'],
    on_change: ['refetch'],
  },
  folder: {
    type: 'string',
    required: true,
    depends_on: ['space'],
    get_allowed_values: getClickUpFolderIdAllowedValues,
  },
} satisfies TQoreOptions;

const getFolder = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLICKUP_APP_NAME,
  action: 'get_folder',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, folder } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['folder'],
      ErrorClass: ClickUpError,
    });

    try {
      return await fetchClickUpData({
        token,
        path: `folder/${folder}`,
      });
    } catch (error) {
      throw new ClickUpError(`Failed to get the folder: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' },
      orderindex: { type: 'number' },
      override_statuses: { type: 'bool' },
      hidden: { type: 'bool' },
      space: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
      task_count: { type: 'string' },
      archived: { type: 'bool' },
      statuses: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
      lists: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              orderindex: { type: 'number' },
              status: { type: 'string' },
              priority: { type: 'string' },
              assignee: { type: 'string' },
              task_count: { type: 'number' },
              due_date: { type: 'string' },
              start_date: { type: 'string' },
              space: {
                type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    access: { type: 'bool' },
                  },
                },
              },
              archived: { type: 'bool' },
              override_statuses: { type: 'string' },
              statuses: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      id: { type: 'string' },
                      status: { type: 'string' },
                      orderindex: { type: 'number' },
                      color: { type: 'string' },
                      type: { type: 'string' },
                      status_group: { type: 'string' },
                    },
                  },
                },
              },
              permission_level: { type: 'string' },
            },
          },
        },
      },
      permission_level: { type: 'string' },
    },
  },
});

export default getFolder;
