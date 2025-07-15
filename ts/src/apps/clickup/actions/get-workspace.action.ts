import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { fetchClickUpData } from '../helpers/constants';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';

const options = {
  workspace: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getClickUpWorkspaceIdAllowedValues,
  },
} satisfies TQoreOptions;

const getWorkspace = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLICKUP_APP_NAME,
  action: 'get_workspace',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, workspace } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['workspace'],
      ErrorClass: ClickUpError,
    });

    try {
      const workspaceResponse = await fetchClickUpData<{ team: { members: []; roles: [] } }>({
        token,
        path: `team/${workspace}`,
      });

      return workspaceResponse.team;
    } catch (error) {
      throw new ClickUpError(`Failed to get workspace: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' },
      color: { type: 'string' },
      avatar: { type: 'string' },
      members: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              user: {
                type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'number' },
                    username: { type: 'string' },
                    email: { type: 'string' },
                    color: { type: 'string' },
                    profilePicture: { type: 'string' },
                    initials: { type: 'string' },
                    role: { type: 'number' },
                    role_subtype: { type: 'number' },
                    role_key: { type: 'string' },
                    custom_role: { type: 'string' },
                    last_active: { type: 'string' },
                    date_joined: { type: 'string' },
                    date_invited: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      roles: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'number' },
              name: { type: 'string' },
              custom: { type: 'boolean' },
            },
          },
        },
      },
    },
  },
});

export default getWorkspace;
