/* eslint-disable max-len */

import { AsanaEventInfo } from './event-info';

const AsanaAppEn = {
  displayName: 'Asana',
  groups: ['Project & Task Management'],
  shortDesc: 'Automate workflows by integrating with the Asana project management platform',
  longDesc:
    'Connect to Asana to automate task management, project monitoring, and team collaboration workflows. Use these triggers to respond to changes in tasks, projects, and workspaces.',
  triggers: {
    task_completed: {
      displayName: 'Task Completed',
      shortDesc: 'Triggers when a task is marked complete in a specific project',
      longDesc:
        'Initiates a workflow when any task within the specified project is marked as completed. Use this to automate follow-up actions or notifications upon task completion.',
      options: {
        project: {
          displayName: 'Project ID',
          shortDesc: 'The project containing the completed tasks',
          longDesc: 'The unique identifier of the project where task completions will be monitored',
        },
        workspace: {
          displayName: 'Workspace ID',
          shortDesc: 'The workspace containing the project',
          longDesc: 'The unique identifier of the workspace where the project exists',
        },
      },
      event_info: AsanaEventInfo,
    },
    attachment_added: {
      displayName: 'Attachment Added',
      shortDesc: 'Triggers when an attachment is uploaded to a task',
      longDesc:
        'Initiates a workflow when a file is attached to any task within the specified project. Optionally filter by a specific task. Use this to process or track files as they are added to tasks.',
      options: {
        project: {
          displayName: 'Project ID',
          shortDesc: 'The project containing the tasks with attachments',
          longDesc:
            'The unique identifier of the project where attachment activities will be monitored',
        },
        task: {
          displayName: 'Task ID (Optional)',
          shortDesc: 'Specific task to monitor for attachments',
          longDesc:
            'The unique identifier of a specific task to monitor. If not provided, attachments from all tasks in the project will trigger the workflow',
        },
        workspace: {
          displayName: 'Workspace ID',
          shortDesc: 'The workspace containing the project',
          longDesc: 'The unique identifier of the workspace where the project exists',
        },
      },
      event_info: AsanaEventInfo,
    },
    subtask_completed: {
      displayName: 'Subtask Completed',
      shortDesc: 'Triggers when a subtask is marked complete',
      longDesc:
        'Initiates a workflow when a subtask within a specific parent task is marked as completed. Use this to track progress on multi-stage tasks or to trigger the next steps in a workflow.',
      options: {
        project: {
          displayName: 'Project ID',
          shortDesc: 'The project containing the parent task',
          longDesc: 'The unique identifier of the project where the parent task exists',
        },
        workspace: {
          displayName: 'Workspace ID',
          shortDesc: 'The workspace containing the project',
          longDesc: 'The unique identifier of the workspace where the project exists',
        },
        task: {
          displayName: 'Parent Task ID',
          shortDesc: 'The parent task containing the subtasks',
          longDesc:
            'The unique identifier of the parent task whose subtasks will be monitored for completion',
        },
      },
      event_info: AsanaEventInfo,
    },
    project_task_added: {
      displayName: 'Project Task Added',
      shortDesc: 'Triggers when a new task is created in a project',
      longDesc:
        'Initiates a workflow whenever a new task is added to the specified project. Use this to automatically process, categorize, or assign new tasks as they are created.',
      options: {
        project: {
          displayName: 'Project ID',
          shortDesc: 'The project to monitor for new tasks',
          longDesc:
            'The unique identifier of the project where new task creation will be monitored',
        },
        workspace: {
          displayName: 'Workspace ID',
          shortDesc: 'The workspace containing the project',
          longDesc: 'The unique identifier of the workspace where the project exists',
        },
      },
      event_info: AsanaEventInfo,
    },
    project_added: {
      displayName: 'Project Added',
      shortDesc: 'Triggers when a new project is created in a workspace',
      longDesc:
        'Initiates a workflow whenever a new project is created within the specified workspace. Use this to automate project setup, create standard templates, or notify team members about new initiatives.',
      options: {
        workspace: {
          displayName: 'Workspace ID',
          shortDesc: 'The workspace to monitor for new projects',
          longDesc:
            'The unique identifier of the workspace where new project creation will be monitored',
        },
      },
      event_info: AsanaEventInfo,
    },
    task_comment_added: {
      displayName: 'Task Comment Added',
      shortDesc: 'Triggers when a comment is added to a specific task',
      longDesc:
        'Initiates a workflow when a new comment is posted on the specified task. Use this to monitor discussions, notify stakeholders, or track communication around critical tasks.',
      options: {
        project: {
          displayName: 'Project ID',
          shortDesc: 'The project containing the task',
          longDesc: 'The unique identifier of the project where the task exists',
        },
        workspace: {
          displayName: 'Workspace ID',
          shortDesc: 'The workspace containing the project',
          longDesc: 'The unique identifier of the workspace where the project exists',
        },
        task: {
          displayName: 'Task ID',
          shortDesc: 'The specific task to monitor for comments',
          longDesc: 'The unique identifier of the task where comments will be monitored',
        },
      },
      event_info: AsanaEventInfo,
    },
    task_story_added: {
      displayName: 'Task Story Added',
      shortDesc: 'Triggers when any activity occurs on a task',
      longDesc:
        'Initiates a workflow when any story (comment, status update, field change) is added to a task. This captures all activity including automated system updates. Use this for comprehensive task activity monitoring.',
      options: {
        project: {
          displayName: 'Project ID',
          shortDesc: 'The project containing the task',
          longDesc: 'The unique identifier of the project where the task exists',
        },
        workspace: {
          displayName: 'Workspace ID',
          shortDesc: 'The workspace containing the project',
          longDesc: 'The unique identifier of the workspace where the project exists',
        },
        task: {
          displayName: 'Task ID',
          shortDesc: 'The specific task to monitor for activity',
          longDesc: 'The unique identifier of the task where all activity will be monitored',
        },
      },
      event_info: AsanaEventInfo,
    },
    task_subtask_added: {
      displayName: 'Task Subtask Added',
      shortDesc: 'Triggers when a subtask is created under a parent task',
      longDesc:
        'Initiates a workflow when a new subtask is added to the specified parent task. Use this to track task breakdown or to automate subtask assignments and deadlines.',
      options: {
        project: {
          displayName: 'Project ID',
          shortDesc: 'The project containing the parent task',
          longDesc: 'The unique identifier of the project where the parent task exists',
        },
        workspace: {
          displayName: 'Workspace ID',
          shortDesc: 'The workspace containing the project',
          longDesc: 'The unique identifier of the workspace where the project exists',
        },
        task: {
          displayName: 'Parent Task ID',
          shortDesc: 'The parent task to monitor for new subtasks',
          longDesc:
            'The unique identifier of the parent task where subtask creation will be monitored',
        },
      },
      event_info: AsanaEventInfo,
    },
    task_tag_added: {
      displayName: 'Task Tag Added',
      shortDesc: 'Triggers when a tag is applied to a task',
      longDesc:
        'Initiates a workflow when a tag is added to the specified task. Use this to automate actions based on task categorization or to monitor how tasks are being classified.',
      options: {
        project: {
          displayName: 'Project ID',
          shortDesc: 'The project containing the task',
          longDesc: 'The unique identifier of the project where the task exists',
        },
        workspace: {
          displayName: 'Workspace ID',
          shortDesc: 'The workspace containing the project',
          longDesc: 'The unique identifier of the workspace where the project exists',
        },
        task: {
          displayName: 'Task ID',
          shortDesc: 'The specific task to monitor for tag additions',
          longDesc: 'The unique identifier of the task where tag additions will be monitored',
        },
      },
      event_info: AsanaEventInfo,
    },
    team_added: {
      displayName: 'Team Added',
      shortDesc: 'Triggers when a new team is created in a workspace',
      longDesc:
        'Initiates a workflow when a new team is formed within the specified workspace. Use this to automate team onboarding processes or to set up default team resources.',
      options: {
        workspace: {
          displayName: 'Workspace ID',
          shortDesc: 'The workspace to monitor for new teams',
          longDesc:
            'The unique identifier of the workspace where new team creation will be monitored',
        },
      },
      event_info: AsanaEventInfo,
    },
    user_added: {
      displayName: 'User Added',
      shortDesc: 'Triggers when a user joins a workspace',
      longDesc:
        'Initiates a workflow when a new user is added to the specified workspace. Use this to automate user onboarding, permission assignments, or welcome notifications.',
      options: {
        workspace: {
          displayName: 'Workspace ID',
          shortDesc: 'The workspace to monitor for new users',
          longDesc:
            'The unique identifier of the workspace where new user additions will be monitored',
        },
      },
      event_info: AsanaEventInfo,
    },
    tag_created: {
      displayName: 'Tag Created',
      shortDesc: 'Triggers when a new tag is created in a workspace',
      longDesc:
        'Initiates a workflow when a new tag is created within the specified workspace. Use this to monitor taxonomy changes or to standardize tag usage across projects.',
      options: {
        workspace: {
          displayName: 'Workspace ID',
          shortDesc: 'The workspace to monitor for new tags',
          longDesc:
            'The unique identifier of the workspace where new tag creation will be monitored',
        },
      },
      event_info: AsanaEventInfo,
    },
    task_moved_to_section: {
      displayName: 'Task Moved to Section',
      shortDesc: 'Triggers when a task is moved to a different section',
      longDesc:
        'Initiates a workflow when a task is moved between sections in the specified project. Use this to track task progress through different stages or to automate actions based on task status changes.',
      options: {
        project: {
          displayName: 'Project ID',
          shortDesc: 'The project containing the sections and tasks',
          longDesc:
            'The unique identifier of the project where task movements between sections will be monitored',
        },
        workspace: {
          displayName: 'Workspace ID',
          shortDesc: 'The workspace containing the project',
          longDesc: 'The unique identifier of the workspace where the project exists',
        },
      },
      event_info: AsanaEventInfo,
    },
  },
  actions: {
    getEvents: { groups: ['Time & Events'] },
    getGoals: { groups: ['Goals'] },
    createGoal: { groups: ['Goals'] },
    deleteGoal: { groups: ['Goals'] },
    getGoal: { groups: ['Goals'] },
    updateGoal: { groups: ['Goals'] },

    getProjects: { groups: ['Projects'] },
    createProject: { groups: ['Projects'] },
    deleteProject: { groups: ['Projects'] },
    getProject: { groups: ['Projects'] },
    updateProject: { groups: ['Projects'] },
    getSectionsForProject: { groups: ['Projects'] },
    createSectionForProject: { groups: ['Projects'] },
    getTasksForProject: { groups: ['Projects'] },

    getSection: { groups: ['Sections'] },
    updateSection: { groups: ['Sections'] },
    deleteSection: { groups: ['Sections'] },
    getTasksForSection: { groups: ['Sections'] },

    getTasks: { groups: ['Tasks'] },
    createTask: { groups: ['Tasks'] },
    deleteTask: { groups: ['Tasks'] },
    getTask: { groups: ['Tasks'] },
    updateTask: { groups: ['Tasks'] },
    getDependenciesForTask: { groups: ['Tasks'] },
    getDependentsForTask: { groups: ['Tasks'] },
    getStoriesForTask: { groups: ['Tasks'] },
    createStoryForTask: { groups: ['Tasks'] },
    getSubtasksForTask: { groups: ['Tasks'] },
    createSubtaskForTask: { groups: ['Tasks'] },

    getTags: { groups: ['Tags'] },
    createTag: { groups: ['Tags'] },
    deleteTag: { groups: ['Tags'] },
    getTag: { groups: ['Tags'] },
    updateTag: { groups: ['Tags'] },
    getTasksForTag: { groups: ['Tags'] },

    getProjectsForTeam: { groups: ['Teams & Users'] },
    createProjectForTeam: { groups: ['Teams & Users'] },
    getUsers: { groups: ['Teams & Users'] },
    getUser: { groups: ['Teams & Users'] },

    getWorkspaces: { groups: ['Workspaces'] },
    getWorkspace: { groups: ['Workspaces'] },
    updateWorkspace: { groups: ['Workspaces'] },

    getTimePeriods: { groups: ['Other'] },
  },
  searchOptions: {
    orderBy: {
      displayName: 'Order By',
      shortDesc: 'Sort results by a specific field',
      longDesc: 'Define the field and direction to sort search results',
      type: {
        fields: {
          field: {
            displayName: 'Field',
            shortDesc: 'The field to sort by',
            longDesc: 'The name of the field to use for sorting results',
          },
          direction: {
            displayName: 'Direction',
            shortDesc: 'Sort direction',
            longDesc: 'The direction to sort results (ascending or descending)',
          },
        },
      },
    },
  },
  expressions: {
    '&&': {
      displayName: 'And',
      shortDesc: 'Logical AND operator',
      longDesc: 'Combines multiple conditions where all must be true',
    },
    '||': {
      displayName: 'Or',
      shortDesc: 'Logical OR operator',
      longDesc: 'Combines multiple conditions where at least one must be true',
    },
    '==': {
      displayName: 'Equals',
      shortDesc: 'Field equals value',
      longDesc: 'Matches records where the field equals the specified value',
    },
    '!=': {
      displayName: 'Not Equals',
      shortDesc: 'Field does not equal value',
      longDesc: 'Matches records where the field does not equal the specified value',
    },
    '>': {
      displayName: 'Greater Than',
      shortDesc: 'Field is greater than value',
      longDesc: 'Matches records where the field value is greater than the specified value',
    },
    '>=': {
      displayName: 'Greater Than or Equal',
      shortDesc: 'Field is greater than or equal to value',
      longDesc: 'Matches records where the field value is greater than or equal to the specified value',
    },
    '<': {
      displayName: 'Less Than',
      shortDesc: 'Field is less than value',
      longDesc: 'Matches records where the field value is less than the specified value',
    },
    '<=': {
      displayName: 'Less Than or Equal',
      shortDesc: 'Field is less than or equal to value',
      longDesc: 'Matches records where the field value is less than or equal to the specified value',
    },
    'is-set': {
      displayName: 'Is Set',
      shortDesc: 'Field has a value',
      longDesc: 'Matches records where the field has a value (is not empty)',
    },
    'is-not-set': {
      displayName: 'Is Not Set',
      shortDesc: 'Field has no value',
      longDesc: 'Matches records where the field has no value (is empty)',
    },
    contains: {
      displayName: 'Contains',
      shortDesc: 'Field contains value',
      longDesc: 'Matches records where the field contains the specified substring',
    },
    'starts-with': {
      displayName: 'Starts With',
      shortDesc: 'Field starts with value',
      longDesc: 'Matches records where the field value starts with the specified prefix',
    },
    'ends-with': {
      displayName: 'Ends With',
      shortDesc: 'Field ends with value',
      longDesc: 'Matches records where the field value ends with the specified suffix',
    },
  },
};

export default AsanaAppEn;
