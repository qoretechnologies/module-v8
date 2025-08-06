import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { getAsanaAssigneeIdAllowedValues } from './helpers/get-assignee-id-allowed-values';
import { getAsanaProjectIdAllowedValuesRest } from './helpers/get-project-id-allowed-values';
import { getAsanaSectionIdAllowedValues } from './helpers/get-section-id-allowed-values';
import { getAsanaTagIdAllowedValuesRest } from './helpers/get-tag-id-allowed-values';
import { getAsanaTeamIdAllowedValues } from './helpers/get-team-id-allowed-values';
import { getAsanaTimePeriodIdAllowedValues } from './helpers/get-time-period-id-allowed-values';
import { getAsanaUserIdAllowedValuesRest } from './helpers/get-user-id-allowed-values';
import { getAsanaWorkspaceIdAllowedValuesRest } from './helpers/get-workspace-id-allowed-values';

export const ASANA_APP_NAME = 'Asana';

export const ASANA_ALLOWED_PATHS = {
  '/tasks': {
    GET: {
      group: 'tasks',
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
      group: 'tasks',
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
          element_allowed_values_creatable: true,
          rest_get_element_allowed_values: getAsanaTagIdAllowedValuesRest,
        },
        projects: {
          required_groups: ['tasks_group'],
          type: {
            type: 'list',
            element_type: 'string',
          },
          element_allowed_values_creatable: true,
          rest_get_element_allowed_values: getAsanaProjectIdAllowedValuesRest,
        },
      },
    },
  },
  '/tasks/{task_gid}': {
    DELETE: {
      group: 'tasks',
    },
    GET: {
      group: 'tasks',
    },
    PUT: {
      group: 'tasks',
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
          element_allowed_values_creatable: true,
          rest_get_element_allowed_values: getAsanaTagIdAllowedValuesRest,
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
          element_allowed_values_creatable: true,
          rest_get_element_allowed_values: getAsanaUserIdAllowedValuesRest,
        },
        projects: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          element_allowed_values_creatable: true,
          rest_get_element_allowed_values: getAsanaProjectIdAllowedValuesRest,
        },
      },
    },
  },
  '/tasks/{task_gid}/subtasks': {
    GET: {
      group: 'tasks',
    },
    POST: {
      group: 'tasks',
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
    GET: {
      group: 'tasks',
    },
  },
  '/tasks/{task_gid}/dependents': {
    GET: {
      group: 'tasks',
    },
  },
  '/tasks/{task_gid}/stories': {
    GET: {
      group: 'tasks',
    },
    POST: {
      group: 'tasks',
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
    GET: {
      group: 'workspaces',
    },
  },
  '/workspaces/{workspace_gid}': {
    GET: {
      group: 'workspaces',
      override_options: {
        workspace_gid: {
          required: true,
          rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
        },
      },
    },
    PUT: {
      group: 'workspaces',
      override_options: {
        workspace_gid: {
          required: true,
          rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
        },
      },
    },
  },
  '/users': {
    GET: {
      group: 'users',
    },
  },
  '/users/{user_gid}': {
    GET: {
      group: 'users',
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
      group: 'projects',
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
      group: 'projects',
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
          element_allowed_values_creatable: true,
          rest_get_element_allowed_values: getAsanaUserIdAllowedValuesRest,
        },
        members: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          element_allowed_values_creatable: true,
          rest_get_element_allowed_values: getAsanaUserIdAllowedValuesRest,
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
      group: 'projects',
      override_options: {
        project_gid: {
          required: true,
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaProjectIdAllowedValuesRest,
        },
      },
    },
    GET: {
      group: 'projects',
      override_options: {
        project_gid: {
          required: true,
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaProjectIdAllowedValuesRest,
        },
      },
    },
    PUT: {
      group: 'projects',
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
          element_allowed_values_creatable: true,
          rest_get_element_allowed_values: getAsanaUserIdAllowedValuesRest,
        },
        members: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          element_allowed_values_creatable: true,
          rest_get_element_allowed_values: getAsanaUserIdAllowedValuesRest,
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
      group: 'tasks',
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
      group: 'sections',
      override_options: {
        project_gid: {
          required: true,
          allowed_values_creatable: true,
          rest_get_allowed_values: getAsanaProjectIdAllowedValuesRest,
        },
      },
    },
    POST: {
      group: 'sections',
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
      group: 'periods',
      override_options: {
        workspace: {
          required: true,
          rest_get_allowed_values: getAsanaWorkspaceIdAllowedValuesRest,
        },
      },
    },
  },
  '/sections/{section_gid}': {
    DELETE: {
      group: 'sections',
    },
    GET: {
      group: 'sections',
    },
    PUT: {
      group: 'sections',
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
    GET: {
      group: 'tasks',
    },
  },
  '/tags': {
    GET: {
      group: 'tags',
    },
    POST: {
      group: 'tags',
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
          element_allowed_values_creatable: true,
          rest_get_element_allowed_values: getAsanaUserIdAllowedValuesRest,
        },
      },
    },
  },
  '/tags/{tag_gid}': {
    DELETE: {
      group: 'tags',
      override_options: {
        tag_gid: {
          required: true,
          rest_get_allowed_values: getAsanaTagIdAllowedValuesRest,
        },
      },
    },
    GET: {
      group: 'tags',
      override_options: {
        tag_gid: {
          required: true,
          rest_get_allowed_values: getAsanaTagIdAllowedValuesRest,
        },
      },
    },
    PUT: {
      group: 'tags',
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
      group: 'tasks',
      override_options: {
        tag_gid: {
          required: true,
          rest_get_allowed_values: getAsanaTagIdAllowedValuesRest,
        },
      },
    },
  },
  '/teams': {
    GET: {
      group: 'teams',
    },
  },
  '/teams/{team_gid}/projects': {
    GET: {
      group: 'projects',
    },
    POST: {
      group: 'projects',
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
      group: 'events',
      override_options: {
        resource: {
          required: true,
        },
      },
    },
  },
  '/goals': {
    POST: {
      group: 'goals',
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
      group: 'goals',
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
    DELETE: {
      group: 'goals',
    },
    GET: {
      group: 'goals',
    },
    PUT: {
      group: 'goals',
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
} satisfies TAllowedPaths;

export const ASANA_SWAGGER_API_PATH = '';
