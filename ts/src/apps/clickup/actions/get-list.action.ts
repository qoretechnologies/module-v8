import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { fetchClickUpData } from '../helpers/constants';
import { getClickUpFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';
import { getClickUpListIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import { getClickUpSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';
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
    depends_on: ['workspace'],
    on_change: ['refetch'],
  },
  folder: {
    type: 'string',
    required: false,
    get_allowed_values: getClickUpFolderIdAllowedValues,
  },
  list: {
    type: 'string',
    required: true,
    get_allowed_values: getClickUpListIdAllowedValues,
  },
} satisfies TQoreOptions;

const getList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLICKUP_APP_NAME,
  action: 'get_lists',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, list } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['list'],
      ErrorClass: ClickUpError,
    });

    try {
      return await fetchClickUpData({
        token,
        path: `list/${list}`,
      });
    } catch (error) {
      throw new ClickUpError(`Failed to list lists: ${error}`);
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
            hide_label: { type: 'bool' },
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
      assignee: { type: 'string' },
      due_date: { type: 'string' },
      due_date_time: { type: 'bool' },
      start_date: { type: 'string' },
      start_date_time: { type: 'string' },
      folder: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            name: { type: 'string' },
            hidden: { type: 'bool' },
            access: { type: 'bool' },
          },
        },
      },
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
      inbound_address: { type: 'string' },
      archived: { type: 'bool' },
      override_statuses: { type: 'bool' },
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
      permission_level: { type: 'string' },
    },
  },
});

export default getList;
