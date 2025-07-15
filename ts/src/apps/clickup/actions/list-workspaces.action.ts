import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { fetchClickUpData } from '../helpers/constants';

const listWorkspaces = QoreAppCreator.createLocalizedAction({
  app: CLICKUP_APP_NAME,
  action: 'list_workspaces',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: ClickUpError,
    });

    try {
      const workspacesResponse = await fetchClickUpData<{ teams: [] }>({
        token,
        path: `team`,
      });

      return { workspaces: workspacesResponse.teams || [] };
    } catch (error) {
      throw new ClickUpError(`Failed to list workspaces: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      workspaces: {
        type: {
          type: 'list',
          element_type: {
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
                            color: { type: 'string' },
                            profilePicture: { type: 'string' },
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
});

export default listWorkspaces;
