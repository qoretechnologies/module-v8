import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ASANA_APP_NAME } from '../constants';
import { getAsanaWorkspaceIdAllowedValuesRest } from '../helpers/get-workspace-id-allowed-values';
import { asanaEventInfoType, asanaWebhookEchoHeader, asanaWebhookInfoLocation } from './constants';
import {
  deregisterAsanaWebhook,
  getAsanaWorkspace,
  getAsanaWorkspaceTeams,
  getCurrentAsanaUser,
} from './helpers';
import { Debugger } from '../../../utils/Debugger';

const asanaNewTeamTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ASANA_APP_NAME,
  action: 'team_added',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: {
    workspace: {
      type: 'string',
      required: true,
      rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
    },
  },
  webhook_register: async (context, url) => {
    const token = context?.conn_opts?.token;
    const workspace = context?.opts?.workspace;

    if (!token) {
      throw new Error('Token is required to register New Team Asana webhook');
    }

    if (!workspace) {
      throw new Error('Workspace is required to register New Team Asana webhook');
    }

    const { data } = await QorusRequest.post<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          data: {
            resource: workspace,
            target: url,
            filters: [
              {
                resource_type: 'team',
                action: 'added',
              },
            ],
          },
        },
        path: '/api/1.0/webhooks',
      },
      {
        url: 'https://app.asana.com',
        endpointId: 'Asana',
      }
    );

    return { webhook: data.data };
  },
  webhook_deregister: deregisterAsanaWebhook,
  webhook_echo_header: asanaWebhookEchoHeader,
  webhook_event_loc: asanaWebhookInfoLocation,
  get_example_event_data: async (context) => {
    const mockData = {
      action: 'added',
      type: 'team',
      created_at: new Date().toISOString(),
      parent: {
        gid: '1208408525816938',
        resource_type: 'workspace',
        name: 'Workspace Name',
      },
      resource: {
        gid: '1208408525816940',
        resource_type: 'team',
        name: 'New Team Example',
      },
      user: {
        gid: '1206353569757060',
        resource_type: 'user',
        name: 'user@example.com',
      },
    };

    const token = context?.conn_opts?.token;
    const workspaceId = context?.opts?.workspace;

    if (!token || !workspaceId) {
      return mockData;
    }

    try {
      const [user, workspace, teams] = await Promise.all([
        getCurrentAsanaUser(token),
        getAsanaWorkspace(token, workspaceId),
        getAsanaWorkspaceTeams(token, workspaceId),
      ]);

      if (user) {
        mockData.user.gid = user.gid;
        mockData.user.name = user.name;
      }

      if (workspace) {
        mockData.parent.gid = workspace.gid;
        mockData.parent.name = workspace.name;
      }

      const team = teams?.[0];
      if (team) {
        mockData.resource.gid = team.gid;
        mockData.resource.name = team.name;
      }
    } catch (error) {
      Debugger.log(`Asana Error: Couldn't get example event data`, error);
    } finally {
      return mockData;
    }
  },
  event_info: {
    desc: 'New team event data',
    type: asanaEventInfoType,
  },
});

export default asanaNewTeamTrigger;
