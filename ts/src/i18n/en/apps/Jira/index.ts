const JiraAppEn = {
  displayName: 'Jira',
  groups: ['Project & Task Management'],
  shortDesc: 'Collection of actions to interact with the Jira API',
  longDesc: 'Collection of actions to interact with the Jira API',
  searchOptions: {
    orderBy: {
      displayName: 'Order by',
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
      longDesc: 'Combines multiple conditions where all must be true (JQL: AND)',
    },
    '||': {
      displayName: 'Or',
      shortDesc: 'Logical OR operator',
      longDesc: 'Combines multiple conditions where at least one must be true (JQL: OR)',
    },
    '==': {
      displayName: 'Equals',
      shortDesc: 'Field equals value',
      longDesc: 'Matches issues where the field equals the specified value (JQL: =)',
    },
    '!=': {
      displayName: 'Not equals',
      shortDesc: 'Field does not equal value',
      longDesc: 'Matches issues where the field does not equal the specified value (JQL: !=)',
    },
    '>': {
      displayName: 'Greater than',
      shortDesc: 'Field is greater than value',
      longDesc: 'Matches issues where the field value is greater than the specified value (JQL: >)',
    },
    '>=': {
      displayName: 'Greater than or equal',
      shortDesc: 'Field is greater than or equal to value',
      longDesc:
        'Matches issues where the field value is greater than or equal to the specified value (JQL: >=)',
    },
    '<': {
      displayName: 'Less than',
      shortDesc: 'Field is less than value',
      longDesc: 'Matches issues where the field value is less than the specified value (JQL: <)',
    },
    '<=': {
      displayName: 'Less than or equal',
      shortDesc: 'Field is less than or equal to value',
      longDesc:
        'Matches issues where the field value is less than or equal to the specified value (JQL: <=)',
    },
    'is-set': {
      displayName: 'Is set',
      shortDesc: 'Field has a value',
      longDesc: 'Matches issues where the field has a value (JQL: IS NOT EMPTY)',
    },
    'is-not-set': {
      displayName: 'Is not set',
      shortDesc: 'Field has no value',
      longDesc: 'Matches issues where the field has no value (JQL: IS EMPTY)',
    },
    contains: {
      displayName: 'Contains',
      shortDesc: 'Field contains value',
      longDesc: 'Matches issues where the field contains the specified text (JQL: ~)',
    },
  },
  actions: {
    // Banner actions
    getBanner: {
      displayName: 'Get announcement banner',
      shortDesc: 'Gets the current announcement banner configuration',
      longDesc: 'Retrieves the current announcement banner configuration for the Jira instance',
      groups: ['Banner'],
    },
    setBanner: {
      displayName: 'Set announcement banner',
      shortDesc: 'Updates the announcement banner configuration',
      longDesc: 'Updates the announcement banner configuration for the Jira instance',
      groups: ['Banner'],
    },
    // Field actions
    getFields: {
      displayName: 'Get fields',
      shortDesc: 'Gets all fields in the system',
      longDesc: 'Returns all fields, both system and custom fields, in the Jira instance',
      groups: ['Fields'],
    },
    createCustomField: {
      displayName: 'Create custom field',
      shortDesc: 'Creates a new custom field',
      longDesc: 'Creates a new custom field in the Jira instance',
      groups: ['Fields'],
    },
    updateCustomField: {
      displayName: 'Update custom field',
      shortDesc: 'Updates a custom field',
      longDesc: 'Updates the name and description of a custom field',
      groups: ['Fields'],
    },
    trashCustomField: {
      displayName: 'Trash custom field',
      shortDesc: 'Moves a custom field to trash',
      longDesc: 'Moves a custom field to the trash. The custom field can be restored from trash within 60 days',
      groups: ['Fields'],
    },
    // Issue actions
    searchAndReconsileIssuesUsingJqlPost: {
      displayName: 'Search issues',
      shortDesc: 'Searches for issues using JQL',
      longDesc: 'Searches for issues using JQL (Jira Query Language). Returns issues matching the search criteria',
      groups: ['Issues'],
      options: {
        jql: {
          displayName: 'JQL query',
          shortDesc: 'JQL query to search for issues. Must be a bounded query with search restrictions.',
          longDesc: `A JQL (Jira Query Language) expression to search for issues.

**Common JQL Examples:**
- \`project = "MY-PROJECT"\` - All issues in a project
- \`assignee = currentUser()\` - Issues assigned to current user
- \`status = "In Progress"\` - Issues with specific status
- \`created >= -7d\` - Issues created in the last 7 days
- \`priority = High AND status != Done\` - High priority open issues
- \`labels in (bug, critical)\` - Issues with specific labels
- \`reporter = currentUser() ORDER BY created DESC\` - Your reported issues, newest first

**Note:** For performance reasons, this field requires a bounded query (a query with search restrictions). Unbounded queries like \`order by key desc\` are not allowed.`,
        },
      },
    },
    createIssue: {
      displayName: 'Create issue',
      shortDesc: 'Creates a new issue',
      longDesc: 'Creates a new issue in a Jira project',
      groups: ['Issues'],
    },
    deleteIssue: {
      displayName: 'Delete issue',
      shortDesc: 'Deletes an issue',
      longDesc: 'Deletes an issue from a Jira project',
      groups: ['Issues'],
    },
    getIssue: {
      displayName: 'Get issue',
      shortDesc: 'Gets an issue by ID or key',
      longDesc: 'Retrieves the details of a specific issue by its ID or key',
      groups: ['Issues'],
    },
    editIssue: {
      displayName: 'Edit issue',
      shortDesc: 'Updates an existing issue',
      longDesc: 'Updates the fields of an existing issue',
      groups: ['Issues'],
    },
    // Comment actions
    getComments: {
      displayName: 'Get comments',
      shortDesc: 'Gets all comments for an issue',
      longDesc: 'Retrieves all comments for a specific issue',
      groups: ['Comments'],
    },
    addComment: {
      displayName: 'Add comment',
      shortDesc: 'Adds a comment to an issue',
      longDesc: 'Adds a new comment to a specific issue',
      groups: ['Comments'],
    },
    deleteComment: {
      displayName: 'Delete comment',
      shortDesc: 'Deletes a comment from an issue',
      longDesc: 'Deletes a specific comment from an issue',
      groups: ['Comments'],
    },
    getComment: {
      displayName: 'Get comment',
      shortDesc: 'Gets a specific comment',
      longDesc: 'Retrieves a specific comment by its ID',
      groups: ['Comments'],
    },
    updateComment: {
      displayName: 'Update comment',
      shortDesc: 'Updates a comment',
      longDesc: 'Updates an existing comment on an issue',
      groups: ['Comments'],
    },
    // Worklog actions
    getIssueWorklog: {
      displayName: 'Get issue worklogs',
      shortDesc: 'Gets all worklogs for an issue',
      longDesc: 'Retrieves all worklogs for a specific issue',
      groups: ['Worklogs'],
    },
    addWorklog: {
      displayName: 'Add worklog',
      shortDesc: 'Adds a worklog to an issue',
      longDesc: 'Adds a new worklog entry to a specific issue',
      groups: ['Worklogs'],
    },
    deleteWorklog: {
      displayName: 'Delete worklog',
      shortDesc: 'Deletes a worklog from an issue',
      longDesc: 'Deletes a specific worklog entry from an issue',
      groups: ['Worklogs'],
    },
    getWorklog: {
      displayName: 'Get worklog',
      shortDesc: 'Gets a specific worklog',
      longDesc: 'Retrieves a specific worklog entry by its ID',
      groups: ['Worklogs'],
    },
    updateWorklog: {
      displayName: 'Update worklog',
      shortDesc: 'Updates a worklog',
      longDesc: 'Updates an existing worklog entry on an issue',
      groups: ['Worklogs'],
    },
    // Project actions
    getAllProjects: {
      displayName: 'Get all projects',
      shortDesc: 'Gets all projects',
      longDesc: 'Retrieves all projects visible to the authenticated user',
      groups: ['Projects'],
    },
    createProject: {
      displayName: 'Create project',
      shortDesc: 'Creates a new project',
      longDesc: 'Creates a new project in Jira',
      groups: ['Projects'],
    },
    deleteProject: {
      displayName: 'Delete project',
      shortDesc: 'Deletes a project',
      longDesc: 'Deletes a project from Jira',
      groups: ['Projects'],
    },
    getProject: {
      displayName: 'Get project',
      shortDesc: 'Gets a project by ID or key',
      longDesc: 'Retrieves the details of a specific project by its ID or key',
      groups: ['Projects'],
    },
    updateProject: {
      displayName: 'Update project',
      shortDesc: 'Updates a project',
      longDesc: 'Updates the details of an existing project',
      groups: ['Projects'],
    },
  },
  triggers: {
    issue_created: {
      displayName: 'New issue',
      shortDesc: 'Triggers when a new issue is created',
      longDesc: 'Triggers when a new issue is created',
      groups: ['Issues'],
      options: {
        project: {
          displayName: 'Project',
          shortDesc: 'The project to watch for new issues',
          longDesc: 'The project to watch for new issues',
        },
      },
    },
    issue_updated: {
      displayName: 'Updated issue',
      shortDesc: 'Triggers when an issue is updated',
      longDesc: 'Triggers when an issue is updated',
      groups: ['Issues'],
      options: {
        project: {
          displayName: 'Project',
          shortDesc: 'The project to watch for updated issues',
          longDesc: 'The project to watch for updated issues',
        },
      },
    },
    project_created: {
      displayName: 'New project',
      shortDesc: 'Triggers when a new project is created',
      longDesc: 'Triggers when a new project is created',
      groups: ['Projects'],
    },
  },
};

export default JiraAppEn;
