import { TAllowedPaths } from '../../global/models/qore';
import { getAsanaAssigneeIdAllowedValues } from './helpers/get-assignee-id-allowed-values';
import { getAsanaProjectIdAllowedValuesRest } from './helpers/get-project-id-allowed-values';
import { getAsanaSectionIdAllowedValues } from './helpers/get-section-id-allowed-values';
import { getAsanaTagIdAllowedValuesRest } from './helpers/get-tag-id-allowed-values';
import { getAsanaTeamIdAllowedValues } from './helpers/get-team-id-allowed-values';
import { getAsanaTimePeriodIdAllowedValues } from './helpers/get-time-period-id-allowed-values';
import { getAsanaUserIdAllowedValuesRest } from './helpers/get-user-id-allowed-values';
import { getAsanaWorkspaceIdAllowedValuesRest } from './helpers/get-workspace-id-allowed-values';

export const ASANA_APP_NAME = 'Asana';

export const ASANA_ALLOWED_PATHS: TAllowedPaths = {
  '/tasks': {
    GET: {
      override_options: {
        project: {
          required_groups: ['tasks_group'],
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaProjectIdAllowedValuesRest,
        },
        workspace: {
          required_groups: ['tasks_group'],
          rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
        },
        section: {
          required_groups: ['tasks_group'],
          depends_on: ['project'],
          allowed_values_creatable: true,
          get_allowed_values: getAsanaSectionIdAllowedValues,
        },
        assignee: {
          required_groups: ['tasks_group'],
          depends_on: ['workspace'],
          allowed_values_creatable: true,
          get_allowed_values: getAsanaAssigneeIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        name: {
          required: true,
        },
        workspace: {
          required_groups: ['tasks_group'],
          rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
        },
        assignee: {
          depends_on: ['workspace'],
          get_allowed_values: getAsanaAssigneeIdAllowedValues,
        },
        tags: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaTagIdAllowedValuesRest,
        },
        projects: {
          required_groups: ['tasks_group'],
          type: {
            type: 'list',
            element_type: 'string',
          },
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaProjectIdAllowedValuesRest,
        },
      },
    },
  },
  '/tasks/{task_gid}': {
    DELETE: {},
    GET: {},
    PUT: {
      override_options: {
        workspace: {
          rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
        },
        assignee: {
          get_allowed_values: getAsanaAssigneeIdAllowedValues,
          depends_on: ['workspace'],
        },
        tags: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaTagIdAllowedValuesRest,
        },
        completed_by: {
          rest_get_allowed_values: getAsanaUserIdAllowedValuesRest,
          allowed_values_creatable: true,
        },
        created_by: {
          rest_get_allowed_values: getAsanaUserIdAllowedValuesRest,
          allowed_values_creatable: true,
        },
        followers: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaUserIdAllowedValuesRest,
        },
        projects: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaProjectIdAllowedValuesRest,
        },
      },
    },
  },
  '/tasks/{task_gid}/subtasks': {
    GET: {},
    POST: {
      override_options: {
        name: {
          required: true,
        },
        workspace: {
          rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
        },
        assignee: {
          get_allowed_values: getAsanaAssigneeIdAllowedValues,
          depends_on: ['workspace'],
        },
      },
    },
  },
  '/tasks/{task_gid}/dependencies': {
    GET: {},
  },
  '/tasks/{task_gid}/dependents': {
    GET: {},
  },
  '/tasks/{task_gid}/stories': {
    GET: {},
    POST: {
      override_options: {
        text: {
          required_groups: ['stories_group'],
        },
        html_text: {
          required_groups: ['stories_group'],
        },
      },
    },
  },
  '/workspaces': {
    GET: {},
  },
  '/workspaces/{workspace_gid}': {
    GET: {
      override_options: {
        workspace_gid: {
          required: true,
          rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
        },
      },
    },
    PUT: {
      override_options: {
        workspace_gid: {
          required: true,
          rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
        },
      },
    },
  },
  '/users': {
    GET: {},
  },
  '/users/{user_gid}': {
    GET: {
      override_options: {
        user_gid: {
          required: true,
          rest_get_allowed_values: getAsanaUserIdAllowedValuesRest,
        },
      },
    },
  },
  '/projects': {
    GET: {
      override_options: {
        workspace: {
          rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
        },
        team: {
          depends_on: ['workspace'],
          get_allowed_values: getAsanaTeamIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        name: {
          required: true,
        },
        workspace: {
          required_groups: ['projects_group'],
          rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
        },
        team: {
          required_groups: ['projects_group'],
          depends_on: ['workspace'],
          get_allowed_values: getAsanaTeamIdAllowedValues,
        },
        followers: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaUserIdAllowedValuesRest,
        },
        members: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaUserIdAllowedValuesRest,
        },
        owner: {
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaUserIdAllowedValuesRest,
        },
      },
    },
  },
  '/projects/{project_gid}': {
    DELETE: {
      override_options: {
        project_gid: {
          required: true,
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaProjectIdAllowedValuesRest,
        },
      },
    },
    GET: {
      override_options: {
        project_gid: {
          required: true,
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaProjectIdAllowedValuesRest,
        },
      },
    },
    PUT: {
      override_options: {
        project_gid: {
          required: true,
          on_change: ['refetch'],
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaProjectIdAllowedValuesRest,
        },
        followers: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaUserIdAllowedValuesRest,
        },
        members: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaUserIdAllowedValuesRest,
        },
        owner: {
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaUserIdAllowedValuesRest,
        },
        team: {
          required_groups: ['projects_group'],
          get_allowed_values: getAsanaTeamIdAllowedValues,
        },
      },
    },
  },
  '/projects/{project_gid}/tasks': {
    GET: {
      override_options: {
        project_gid: {
          required: true,
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaProjectIdAllowedValuesRest,
        },
      },
    },
  },
  '/projects/{project_gid}/sections': {
    GET: {
      override_options: {
        project_gid: {
          required: true,
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaProjectIdAllowedValuesRest,
        },
      },
    },
    POST: {
      override_options: {
        name: {
          required: true,
        },
        project_gid: {
          required: true,
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaProjectIdAllowedValuesRest,
        },
        insert_before: {
          get_allowed_values: getAsanaSectionIdAllowedValues,
        },
        insert_after: {
          get_allowed_values: getAsanaSectionIdAllowedValues,
        },
      },
    },
  },
  '/time_periods': {
    GET: {
      override_options: {
        workspace: {
          required: true,
          rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
        },
      },
    },
  },
  '/sections/{section_gid}': {
    DELETE: {},
    GET: {},
    PUT: {
      override_options: {
        name: {
          required: true,
        },
        insert_before: {
          get_allowed_values: getAsanaSectionIdAllowedValues,
        },
        insert_after: {
          get_allowed_values: getAsanaSectionIdAllowedValues,
        },
      },
    },
  },
  '/sections/{section_gid}/tasks': {
    GET: {},
  },
  '/tags': {
    GET: {},
    POST: {
      override_options: {
        name: {
          required: true,
        },
        workspace: {
          rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
        },
        followers: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaUserIdAllowedValuesRest,
        },
      },
    },
  },
  '/tags/{tag_gid}': {
    DELETE: {
      override_options: {
        tag_gid: {
          required: true,
          rest_get_allowed_values: getAsanaTagIdAllowedValuesRest,
        },
      },
    },
    GET: {
      override_options: {
        tag_gid: {
          required: true,
          rest_get_allowed_values: getAsanaTagIdAllowedValuesRest,
        },
      },
    },
    PUT: {
      override_options: {
        tag_gid: {
          required: true,
          rest_get_allowed_values: getAsanaTagIdAllowedValuesRest,
        },
      },
    },
  },
  '/tags/{tag_gid}/tasks': {
    GET: {
      override_options: {
        tag_gid: {
          required: true,
          rest_get_allowed_values: getAsanaTagIdAllowedValuesRest,
        },
      },
    },
  },
  '/teams': { GET: {} },
  '/teams/{team_gid}/projects': {
    GET: {},
    POST: {
      override_options: {
        name: {
          required: true,
        },
        team_gid: {
          allowed_values_creatable: true,
          get_allowed_values: getAsanaTeamIdAllowedValues,
        },
      },
    },
  },
  '/events': {
    GET: {
      override_options: {
        resource: {
          required: true,
        },
      },
    },
  },
  '/goals': {
    POST: {
      override_options: {
        workspace: {
          required: true,
          rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
        },
        name: {
          required: true,
        },
        time_period: {
          required: true,
          depends_on: ['workspace'],
          get_allowed_values: getAsanaTimePeriodIdAllowedValues,
        },
      },
    },
    GET: {
      override_options: {
        portfolio: {
          required_groups: ['goals_group'],
        },
        project: {
          required_groups: ['goals_group'],
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaProjectIdAllowedValuesRest,
        },
        workspace: {
          required_groups: ['goals_group'],
          rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
        },
        team: {
          required_groups: ['goals_group'],
          depends_on: ['workspace'],
          get_allowed_values: getAsanaTeamIdAllowedValues,
        },
      },
    },
  },
  '/goals/{goal_gid}': {
    DELETE: {},
    GET: {},
    PUT: {
      override_options: {
        workspace: {
          rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
        },
        team: {
          depends_on: ['workspace'],
          get_allowed_values: getAsanaTeamIdAllowedValues,
        },
        owner: {
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaUserIdAllowedValuesRest,
        },
        time_period: {
          depends_on: ['workspace'],
          get_allowed_values: getAsanaTimePeriodIdAllowedValues,
        },
      },
    },
  },
};

export const ASANA_SWAGGER_API_PATH = '';
